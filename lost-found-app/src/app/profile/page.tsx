import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileCard from '@/components/ProfileCard';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

/**
 * GET /profile
 * User profile page - displays authenticated user's profile information
 */
export default async function ProfilePage() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // Redirect to login if not authenticated
    if (!token) {
      redirect('/login');
    }

    // Verify token
    const decoded = verifyToken(token) as { userId: number; email: string } | null;

    if (!decoded) {
      redirect('/login');
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        studentId: true,
        profileImage: true,
        bio: true,
        isVerified: true,
        reputation: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Redirect if user not found
    if (!user) {
      redirect('/login');
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Navigation */}
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </nav>

        {/* Profile Content */}
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <ProfileCard user={user} />

          {/* Stats Section */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Items Posted</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Items Found</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-medium">Reunions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Profile Privacy</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your email address is kept private. Others will see your name and profile information to contact you about items.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Profile page error:', error);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Profile</h1>
            <p className="text-red-800 mb-4">Failed to load your profile. Please try again.</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

