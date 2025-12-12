import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/'];
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/items'];
  
  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // ========================================
  // HANDLE PROTECTED ROUTES
  // ========================================
  if (isProtectedRoute) {
    // If trying to access protected route without token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Token exists - continue to protected route
    // Token verification happens server-side (in server components/API routes)
    return NextResponse.next();
  }

  // ========================================
  // HANDLE PUBLIC ROUTES
  // ========================================
  if (isPublicRoute) {
    // If trying to access auth pages while already logged in,
    // we'll handle redirect in the page/layout components
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
