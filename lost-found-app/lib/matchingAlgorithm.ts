/**
 * Matching Algorithm for Lost & Found Items
 * Calculates similarity score between lost and found items
 */

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

interface ItemData {
  title: string;
  category: string;
  description: string;
  locationLost?: string | null;
  locationFound?: string | null;
}

interface MatchResult {
  score: number;
  breakdown: {
    categoryScore: number;
    titleScore: number;
    locationScore: number;
    descriptionScore: number;
  };
}

// ============================================
// FUZZY STRING MATCHING
// ============================================

/**
 * Calculates Levenshtein distance between two strings
 * Returns a similarity score between 0 and 1
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.includes(shorter)) return 0.85; // Substring match is 85% similar

  const editDistance = getEditDistance(shorter, longer);
  const similarity = (longer.length - editDistance) / longer.length;

  return Math.max(0, similarity);
}

/**
 * Levenshtein distance algorithm for string comparison
 */
function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];

  for (let k = 0; k <= s1.length; k++) {
    let lastValue = k;
    for (let i = 0; i <= s2.length; i++) {
      if (k === 0) {
        costs[i] = i;
      } else if (i > 0) {
        let newValue = costs[i - 1];
        if (s1.charAt(k - 1) !== s2.charAt(i - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[i]) + 1;
        }
        costs[i - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (k > 0) costs[s2.length] = lastValue;
  }

  return costs[s1.length];
}

// ============================================
// KEYWORD MATCHING
// ============================================

/**
 * Extracts keywords from text (removes common words)
 */
function extractKeywords(text: string): Set<string> {
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'was',
    'are',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'my',
    'your',
    'our',
    'their',
  ]);

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  return new Set(words.filter((word) => word.length > 2 && !commonWords.has(word)));
}

/**
 * Calculate keyword overlap between two texts
 */
function calculateKeywordOverlap(text1: string, text2: string): number {
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);

  if (keywords1.size === 0 || keywords2.size === 0) return 0;

  let overlapCount = 0;
  keywords1.forEach((keyword) => {
    if (keywords2.has(keyword)) {
      overlapCount++;
    }
  });

  const totalUnique = new Set([...keywords1, ...keywords2]).size;
  return overlapCount / totalUnique;
}

// ============================================
// LOCATION MATCHING
// ============================================

/**
 * Check if two locations are similar or nearby
 * For now, we'll do simple string matching
 * In a real app, you might use geocoding/distance calculation
 */
function calculateLocationSimilarity(
  location1: string | null | undefined,
  location2: string | null | undefined
): number {
  if (!location1 || !location2) return 0;

  const similarity = calculateStringSimilarity(location1, location2);

  // Extract city/neighborhood names for partial matching
  const loc1Parts = location1.toLowerCase().split(/[,\s]+/);
  const loc2Parts = location2.toLowerCase().split(/[,\s]+/);

  let partialMatch = 0;
  for (const part1 of loc1Parts) {
    if (part1.length > 2 && loc2Parts.includes(part1)) {
      partialMatch += 1;
    }
  }

  // If any part matches, boost the score
  if (partialMatch > 0) {
    return Math.min(1, similarity + 0.2);
  }

  return similarity;
}

// ============================================
// MAIN MATCHING ALGORITHM
// ============================================

/**
 * Calculate match score between a lost item and a found item
 *
 * Scoring weights:
 * - Category match: 0.35 (most important)
 * - Title/Description similarity: 0.40 (very important)
 * - Location similarity: 0.20 (important)
 * - Keyword overlap: 0.05 (bonus)
 */
export function calculateMatchScore(
  lostItem: ItemData,
  foundItem: ItemData
): MatchResult {
  // 1. Category matching (exact match = 1, no match = 0)
  const categoryScore =
    lostItem.category.toLowerCase() === foundItem.category.toLowerCase() ? 1 : 0;

  // 2. Title and description similarity
  const titleSimilarity = calculateStringSimilarity(lostItem.title, foundItem.title);
  const descriptionSimilarity = calculateStringSimilarity(
    lostItem.description,
    foundItem.description
  );
  const titleDescriptionScore = (titleSimilarity + descriptionSimilarity) / 2;

  // 3. Location similarity
  const locationScore = calculateLocationSimilarity(
    lostItem.locationLost || lostItem.locationFound,
    foundItem.locationFound || foundItem.locationLost
  );

  // 4. Keyword overlap
  const keywordScore = calculateKeywordOverlap(
    `${lostItem.title} ${lostItem.description}`,
    `${foundItem.title} ${foundItem.description}`
  );

  // Calculate weighted score
  const finalScore =
    categoryScore * 0.35 +
    titleDescriptionScore * 0.4 +
    locationScore * 0.2 +
    keywordScore * 0.05;

  return {
    score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
    breakdown: {
      categoryScore,
      titleScore: titleSimilarity,
      locationScore,
      descriptionScore: keywordScore,
    },
  };
}

// ============================================
// MATCH CREATION & RETRIEVAL
// ============================================

/**
 * Check a newly added lost item against all found items
 * Create matches if score >= 0.7
 */
export async function checkMatchesForLostItem(lostItemId: number) {
  try {
    // Fetch the lost item
    const lostItem = await prisma.item.findUnique({
      where: { id: lostItemId },
    });

    if (!lostItem || lostItem.status !== 'lost') return [];

    // Fetch all active found items
    const foundItems = await prisma.item.findMany({
      where: {
        status: 'found',
        itemStatus: 'active',
      },
    });

    const matches = [];

    // Check against each found item
    for (const foundItem of foundItems) {
      const matchResult = calculateMatchScore(
        {
          title: lostItem.title,
          category: lostItem.category,
          description: lostItem.description,
          locationLost: lostItem.locationLost,
          locationFound: lostItem.locationFound,
        },
        {
          title: foundItem.title,
          category: foundItem.category,
          description: foundItem.description,
          locationLost: foundItem.locationLost,
          locationFound: foundItem.locationFound,
        }
      );

      // Log match result for debugging
      console.log(`[MATCHING DEBUG] Lost Item "${lostItem.title}" vs Found Item "${foundItem.title}"`);
      console.log(`  Score: ${matchResult.score} (need 0.7)`);
      console.log(`  Category: ${matchResult.breakdown.categoryScore} (${lostItem.category} vs ${foundItem.category})`);
      console.log(`  Title Similarity: ${matchResult.breakdown.titleScore}`);
      console.log(`  Location: ${matchResult.breakdown.locationScore}`);
      console.log(`  Description/Keywords: ${matchResult.breakdown.descriptionScore}`);

      // Create match if score is high enough
      if (matchResult.score >= 0.7) {
        try {
          const match = await prisma.match.upsert({
            where: {
              lostItemId_foundItemId: {
                lostItemId,
                foundItemId: foundItem.id,
              },
            },
            update: {
              matchScore: matchResult.score,
            },
            create: {
              lostItemId,
              foundItemId: foundItem.id,
              matchScore: matchResult.score,
              status: 'pending',
            },
          });

          matches.push(match);

          // Create notifications for both users
          await Promise.all([
            // Notify lost item owner
            prisma.notification.create({
              data: {
                userId: lostItem.userId,
                type: 'match',
                title: 'Potential Match Found!',
                message: `A potential match for your lost item "${lostItem.title}" was found!`,
                link: `/matches/${match.id}`,
              },
            }),
            // Notify found item owner
            prisma.notification.create({
              data: {
                userId: foundItem.userId,
                type: 'match',
                title: 'Your Found Item May Help!',
                message: `Your found item "${foundItem.title}" may match a lost item someone is looking for!`,
                link: `/matches/${match.id}`,
              },
            }),
          ]);
        } catch (err) {
          console.error('Error creating match:', err);
        }
      }
    }

    return matches;
  } catch (error) {
    console.error('Error checking matches for lost item:', error);
    throw error;
  }
}

/**
 * Check a newly added found item against all lost items
 * Create matches if score >= 0.7
 */
export async function checkMatchesForFoundItem(foundItemId: number) {
  try {
    // Fetch the found item
    const foundItem = await prisma.item.findUnique({
      where: { id: foundItemId },
    });

    if (!foundItem || foundItem.status !== 'found') return [];

    // Fetch all active lost items
    const lostItems = await prisma.item.findMany({
      where: {
        status: 'lost',
        itemStatus: 'active',
      },
    });

    const matches = [];

    // Check against each lost item
    for (const lostItem of lostItems) {
      const matchResult = calculateMatchScore(
        {
          title: lostItem.title,
          category: lostItem.category,
          description: lostItem.description,
          locationLost: lostItem.locationLost,
          locationFound: lostItem.locationFound,
        },
        {
          title: foundItem.title,
          category: foundItem.category,
          description: foundItem.description,
          locationLost: foundItem.locationLost,
          locationFound: foundItem.locationFound,
        }
      );

      // Log match result for debugging
      console.log(`[MATCHING DEBUG] Lost Item "${lostItem.title}" vs Found Item "${foundItem.title}"`);
      console.log(`  Score: ${matchResult.score} (need 0.7)`);
      console.log(`  Category: ${matchResult.breakdown.categoryScore} (${lostItem.category} vs ${foundItem.category})`);
      console.log(`  Title Similarity: ${matchResult.breakdown.titleScore}`);
      console.log(`  Location: ${matchResult.breakdown.locationScore}`);
      console.log(`  Description/Keywords: ${matchResult.breakdown.descriptionScore}`);

      // Create match if score is high enough
      if (matchResult.score >= 0.7) {
        try {
          const match = await prisma.match.upsert({
            where: {
              lostItemId_foundItemId: {
                lostItemId: lostItem.id,
                foundItemId,
              },
            },
            update: {
              matchScore: matchResult.score,
            },
            create: {
              lostItemId: lostItem.id,
              foundItemId,
              matchScore: matchResult.score,
              status: 'pending',
            },
          });

          matches.push(match);

          // Create notifications for both users
          await Promise.all([
            // Notify lost item owner
            prisma.notification.create({
              data: {
                userId: lostItem.userId,
                type: 'match',
                title: 'Potential Match Found!',
                message: `A potential match for your lost item "${lostItem.title}" was found!`,
                link: `/matches/${match.id}`,
              },
            }),
            // Notify found item owner
            prisma.notification.create({
              data: {
                userId: foundItem.userId,
                type: 'match',
                title: 'Your Found Item May Help!',
                message: `Your found item "${foundItem.title}" may match a lost item someone is looking for!`,
                link: `/matches/${match.id}`,
              },
            }),
          ]);
        } catch (err) {
          console.error('Error creating match:', err);
        }
      }
    }

    return matches;
  } catch (error) {
    console.error('Error checking matches for found item:', error);
    throw error;
  }
}

/**
 * Get all matches for a user (both as lost item owner and found item owner)
 */
export async function getUserMatches(userId: number) {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          {
            lostItem: {
              userId,
            },
          },
          {
            foundItem: {
              userId,
            },
          },
        ],
      },
      include: {
        lostItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        foundItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: {
        matchScore: 'desc',
      },
    });

    return matches;
  } catch (error) {
    console.error('Error fetching user matches:', error);
    throw error;
  }
}

/**
 * Mark a match as confirmed
 */
export async function confirmMatch(matchId: number, notes?: string) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: 'confirmed',
        notes,
      },
    });

    return match;
  } catch (error) {
    console.error('Error confirming match:', error);
    throw error;
  }
}
