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

  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  try {
    // Check cache first
    const sessionToken = req.cookies.get('next-auth.session-token')?.value;
    const cacheKey = sessionToken || 'no-token';
    const cachedResult = tokenCache.get(cacheKey);
    
    let token;
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      token = cachedResult.token;
    } else {
      token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production'
      });
      
      // Cache the result
      tokenCache.set(cacheKey, {
        token,
        timestamp: Date.now()
      });
    }

    // If no token and trying to access protected route
    if (!token) {
      const redirectUrl = new URL('/api/auth/signin', req.url);
      redirectUrl.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(redirectUrl);
    }

    // If token exists, handle role-based routing
    const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
    const dashboardRoutes = {
      ADMIN: '/admin/dashboard',
      LANDLORD: '/landlord/dashboard',
      USER: '/listings',
      TENANT: '/dashboard'
    };

    // Only redirect if on root or signin page
    if (pathname === '/' || pathname === '/api/auth/signin') {
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }

    // Check if user is accessing correct role-based routes
    const isCorrectRoute = (
      (userRole === 'ADMIN' && pathname.startsWith('/admin')) ||
      (userRole === 'LANDLORD' && pathname.startsWith('/landlord')) ||
      (userRole === 'USER' && (pathname.startsWith('/dashboard') || pathname.startsWith('/listings'))) ||
      (userRole === 'TENANT' && pathname.startsWith('/dashboard'))
    );

    if (!isCorrectRoute) {
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const redirectUrl = new URL('/api/auth/signin', req.url);
    redirectUrl.searchParams.set('error', 'AuthError');
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    // Protected routes
    '/admin/:path*',
    '/landlord/:path*',
    '/tenant/:path*',
    '/dashboard/:path*',
    // Public routes that need processing
    '/',
    '/api/auth/signin',
    // Exclude static files and most API routes
    '/((?!_next/|static/|api/).*)'
  ],
};