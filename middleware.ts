import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Cache token verification results
const tokenCache = new Map<string, { token: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute cache

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/auth'))
  ) {
    return NextResponse.next();
  }

  // Define allowed public routes
  const publicRoutes = ['/', '/listings', '/api/auth/signin'];
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/listings') ||
    pathname.startsWith('/api/auth');

  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Handle expired token
    // if (token?.exp) {
    //   const expiryTime = Number(token.exp) * 1000;
    //   const currentTime = Date.now();
      
    //   if (currentTime > expiryTime) {
    //     const response = NextResponse.redirect(new URL('/?sessionExpired=true', req.url));
    //     response.cookies.delete('next-auth.session-token');
    //     response.cookies.delete('next-auth.csrf-token');
    //     response.cookies.delete('next-auth.callback-url');
    //     return response;
    //   }
    // }

    // If no token and trying to access protected route, redirect to home
    if (!token && !isPublicRoute) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If token exists, handle role-based routing
    if (token) {
      const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
      const dashboardRoutes = {
        ADMIN: '/admin/dashboard',
        LANDLORD: '/landlord/dashboard',
        USER: '/listings',
        TENANT: '/dashboard'
      };

      // Redirect to appropriate dashboard if on root or login page
      if (pathname === '/') {
        return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
      }

      // Check if user is accessing correct role-based routes
      const isCorrectRoute = (
        (userRole === 'ADMIN' && pathname.startsWith('/admin')) ||
        (userRole === 'LANDLORD' && pathname.startsWith('/landlord')) ||
        (userRole === 'USER' && (pathname.startsWith('/dashboard') || pathname.startsWith('/listings'))) ||
        (userRole === 'TENANT' && pathname.startsWith('/dashboard')) ||
        isPublicRoute
      );

      if (!isCorrectRoute) {
        return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/landlord/:path*',
    '/dashboard/:path*',
    // Public routes that need processing
    '/',
    '/api/auth/signin',
    '/listings/:path*',
    // Exclude static files and most API routes
    '/((?!_next/|static/|api/).*)'
  ],
};