'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getUserFromCookies } from '@/lib/auth';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';

/**
 * Navbar component for authenticated users
 * Shows logout button for logged-in users
 */
export default function Navbar({ isAuthenticated = false, userName = null }) {
  const pathname = usePathname();

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Lost & Found</h1>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated && userName ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/items"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Browse Items
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
