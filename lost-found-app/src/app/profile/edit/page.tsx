import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EditProfileForm from '@/components/EditProfileForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * GET /profile/edit
 * Edit profile page - allows user to modify their profile information
 */
export default async function EditProfilePage() {
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
              href="/profile"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Profile
            </Link>
          </div>
        </nav>

        {/* Edit Form */}
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <EditProfileForm user={user} />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Edit profile page error:', error);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Profile</h1>
            <p className="text-red-800 mb-4">Failed to load your profile. Please try again.</p>
            <Link
              href="/profile"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
