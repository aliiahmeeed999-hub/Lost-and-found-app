import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardProfileCard from '@/components/DashboardProfileCard';

/**
 * GET /dashboard/profile
 * Authenticated user's profile page
 * Protected: Only accessible to authenticated users
 */
export default async function DashboardProfilePage() {
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

    // Fetch user from database to verify existence
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    // Redirect if user not found
    if (!user) {
      redirect('/login');
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">View and manage your profile information</p>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <DashboardProfileCard />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Dashboard profile page error:', error);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Profile</h1>
            <p className="text-red-800 mb-4">Failed to load your profile. Please try again.</p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}
