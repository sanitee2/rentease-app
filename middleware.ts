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

  // Define allowed public routes and common routes
  const publicRoutes = [
    '/', 
    '/listings', 
    '/api/auth/signin',
    '/about',
    '/about-us',
    '/contact'
  ];

  const commonRoutes = [
    '/maintenance',
    '/notifications',
    '/messages',
    '/settings',
    '/payments',
    '/favorites',
    '/viewing-requests',
    '/requests',
    '/profile',
    '/dashboard'
  ];

  // Role-specific routes
  const landlordRoutes = [
    '/landlord/dashboard',
    '/landlord/listings',
    '/landlord/tenants',
    '/landlord/maintenance',
    '/landlord/payments',
    '/landlord/viewing-requests',
    '/landlord/profile'
  ];

  const adminRoutes = [
    '/admin/dashboard',
    '/admin/users',
    '/admin/categories',
    '/admin/amenities',
    '/admin/listings'
  ];
  
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/listings') ||
    pathname.startsWith('/api/auth');
  
  const isCommonRoute = commonRoutes.some(route => 
    pathname.startsWith(route)
  );

  try {
    // Add debug logging in production
    const debug = process.env.NODE_ENV === 'production';
    if (debug) console.log('Middleware processing:', { pathname, isPublicRoute, isCommonRoute });

    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    if (debug) {
      console.log('Token debug:', { 
        hasToken: !!token,
        role: token?.role,
        exp: token?.exp,
        currentTime: Math.floor(Date.now() / 1000)
      });
    }

    // Handle token expiration
    if (token?.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= token.exp) {
        if (debug) console.log('Token expired:', { exp: token.exp, currentTime });
        const response = NextResponse.redirect(new URL('/?sessionExpired=true', req.url));
        // Clear auth cookies
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete(`__Secure-next-auth.session-token`);
        response.cookies.delete('next-auth.csrf-token');
        response.cookies.delete('next-auth.callback-url');
        return response;
      }
    }

    // If no token and trying to access protected route
    if (!token && !isPublicRoute) {
      if (debug) console.log('No token for protected route, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If token exists, handle role-based routing
    if (token) {
      const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
      
      if (debug) {
        console.log('Role-based routing:', { 
          userRole, 
          pathname,
          isRoot: pathname === '/',
          isCommonRoute
        });
      }

      const dashboardRoutes = {
        ADMIN: '/admin/dashboard',
        LANDLORD: '/landlord/dashboard',
        USER: '/listings',
        TENANT: '/dashboard'
      };

      // Redirect to appropriate dashboard if on root or login page
      if (pathname === '/') {
        const redirectUrl = new URL(dashboardRoutes[userRole], req.url);
        if (debug) console.log('Redirecting to dashboard:', redirectUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is accessing correct role-based routes
      const isCorrectRoute = (
        (userRole === 'ADMIN' && (pathname.startsWith('/admin') || isCommonRoute)) ||
        (userRole === 'LANDLORD' && (pathname.startsWith('/landlord') || isCommonRoute)) ||
        (userRole === 'USER' && (pathname.startsWith('/dashboard') || pathname.startsWith('/listings') || isCommonRoute)) ||
        (userRole === 'TENANT' && (pathname.startsWith('/dashboard') || isCommonRoute)) ||
        isPublicRoute
      );

      if (!isCorrectRoute) {
        if (debug) console.log('Invalid route access, redirecting to dashboard');
        return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to home with error parameter
    return NextResponse.redirect(new URL('/?auth_error=true', req.url));
  }
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/landlord/:path*',
    '/dashboard/:path*',
    // Common routes
    '/maintenance/:path*',
    '/notifications/:path*',
    '/messages/:path*',
    '/settings/:path*',
    '/payments/:path*',
    '/favorites/:path*',
    '/viewing-requests/:path*',
    '/requests/:path*',
    '/profile/:path*',
    // Public routes
    '/about/:path*',
    '/about-us/:path*',
    '/contact/:path*',
    '/',
    '/api/auth/signin',
    '/listings/:path*',
    // Exclude static files and most API routes
    '/((?!_next/|static/|api/).*)'
  ],
};