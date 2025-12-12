import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { AuthProvider } from '@/context/AuthContext';


async function getInitialUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      iat: decoded.iat
    };
  } catch (error) {
    console.error('Error getting initial user:', error);
    return null;
  }
}

/**
 * AuthWrapper component
 * Wraps the app with AuthProvider and passes initial user data
 */
export async function AuthWrapper({ children }) {
  const initialUser = await getInitialUser();

  return (
    <AuthProvider initialUser={initialUser}>
      {children}
    </AuthProvider>
  );
}
