import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { checkMatchesForLostItem, checkMatchesForFoundItem } from '@/lib/matchingAlgorithm';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - Make sure API_SECRET is set!
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(base64Image, folder = 'items') {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary API secret is not configured');
    }

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

export async function GET(request) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'lost' or 'found'
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    const skip = (page - 1) * limit;

    // Build filter object
    const where = {};
    if (status && ['lost', 'found'].includes(status)) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    // Get total count for pagination
    const total = await prisma.item.count({ where });

    // Get items with user info
    const items = await prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const user = await getUserFromCookies();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      category,
      status,
      itemStatus,
      locationLost,
      locationFound,
      locationDetails,
      dateLost,
      dateFound,
      color,
      brand,
      distinguishingFeatures,
      contactInfo,
      rewardAmount,
      tags,
      images // Array of base64 data URIs from frontend
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!status || !['lost', 'found'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (status === 'lost' && !locationLost) {
      return NextResponse.json(
        { error: 'Location where item was lost is required' },
        { status: 400 }
      );
    }

    if (status === 'found' && !locationFound) {
      return NextResponse.json(
        { error: 'Location where item was found is required' },
        { status: 400 }
      );
    }

    // Upload images to Cloudinary and get URLs
    let imageUrls = [];
    if (images && Array.isArray(images) && images.length > 0) {
      try {
        // Check if Cloudinary is properly configured
        if (!process.env.CLOUDINARY_API_SECRET) {
          console.error('Cloudinary API secret is missing!');
          return NextResponse.json(
            { error: 'Image upload is not configured. Please contact administrator.' },
            { status: 500 }
          );
        }

        const folder = status === 'lost' ? 'lost-items' : 'found-items';
        const uploadPromises = images.map(img => uploadToCloudinary(img, folder));
        imageUrls = await Promise.all(uploadPromises);
        
        console.log('Successfully uploaded images:', imageUrls);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return NextResponse.json(
          { error: `Failed to upload images: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }

    // Create item in database with Cloudinary URLs
    const item = await prisma.item.create({
      data: {
        userId: user.userId,
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        itemStatus: itemStatus || 'active',
        locationLost: locationLost?.trim() || null,
        locationFound: locationFound?.trim() || null,
        locationDetails: locationDetails?.trim() || null,
        dateLost: dateLost ? new Date(dateLost) : null,
        dateFound: dateFound ? new Date(dateFound) : null,
        color: color?.trim() || null,
        brand: brand?.trim() || null,
        distinguishingFeatures: distinguishingFeatures?.trim() || null,
        contactInfo: contactInfo?.trim() || null,
        rewardAmount: rewardAmount ? parseFloat(rewardAmount) : null,
        tags: tags || [],
        imageUrls: imageUrls // Store Cloudinary URLs in database
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      }
    });

    // Check for matches and create notifications
    try {
      if (status === 'lost') {
        await checkMatchesForLostItem(item.id);
      } else if (status === 'found') {
        await checkMatchesForFoundItem(item.id);
      }
    } catch (err) {
      console.error('Error checking matches:', err);
      // Don't fail the item creation if matching fails
    }

    return NextResponse.json({
      success: true,
      message: 'Item reported successfully',
      item
    }, { status: 201 });

  } catch (error) {
    console.error('Create item error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to create item', details: error.message },
      { status: 500 }
    );
  }
}
