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
      if (token) {
        tokenCache.set(cacheKey, {
          token,
          timestamp: Date.now()
        });
      }
    }

    // Handle public routes
    if (isPublicRoute) {
      // If user is authenticated and on root/signin, redirect to their dashboard
      if (token && (pathname === '/' || pathname === '/api/auth/signin')) {
        const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
        const dashboardRoutes = {
          ADMIN: '/admin/dashboard',
          LANDLORD: '/landlord/dashboard',
          USER: '/listings',
          TENANT: '/dashboard'
        };
        return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
      }
      return NextResponse.next();
    }

    // Handle protected routes
    if (!token) {
      // Store the original URL to redirect back after login
      const callbackUrl = encodeURIComponent(req.url);
      return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${callbackUrl}`, req.url));
    }

    const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
    
    // Define role-specific route permissions
    const roleRoutes = {
      ADMIN: ['/admin'],
      LANDLORD: ['/landlord'],
      USER: ['/dashboard', '/listings'],
      TENANT: ['/dashboard']
    };

    // Check if user has permission for the current route
    const userAllowedPaths = roleRoutes[userRole];
    const isAllowed = userAllowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowed) {
      const dashboardRoutes = {
        ADMIN: '/admin/dashboard',
        LANDLORD: '/landlord/dashboard',
        USER: '/listings',
        TENANT: '/dashboard'
      };
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/api/auth/signin?error=AuthError', req.url));
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