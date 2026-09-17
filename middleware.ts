import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/role-selection',
  '/profile-setup',
  '/subscription',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
  '/terms',
  '/privacy',
];

const authRoutes = ['/login', '/signup'];

const protectedRoutes = [
  '/buyerdashboard',
  '/realtor-dashboard',
  '/my-requests',
  '/saved-properties',
  '/devices',
  '/profile',
  '/settings',
  '/notifications',
];

export  function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const isAuthRoute = authRoutes.some(route => pathname === route);
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Logged-in user tries login/signup → redirect to dashboard
  if (token && isAuthRoute) {
    if (role === 'realtor') {
      return NextResponse.redirect(new URL('/realtor-dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/buyerdashboard', request.url));
  }

  // No token + protected route → go to login
  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based dashboard access
  if (token && isProtectedRoute) {
    if (pathname.startsWith('/buyerdashboard') && role !== 'buyer') {
      if (!role || role === 'null') {
        return NextResponse.redirect(new URL('/role-selection', request.url));
      }
      return NextResponse.redirect(new URL('/realtor-dashboard', request.url));
    }

    if (pathname.startsWith('/realtor-dashboard') && role !== 'realtor') {
      if (!role || role === 'null') {
        return NextResponse.redirect(new URL('/role-selection', request.url));
      }
      return NextResponse.redirect(new URL('/buyerdashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};