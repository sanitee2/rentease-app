import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const TWENTY_MINUTES = 20 * 60; // 20 minutes in seconds

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Define allowed public routes
  const publicRoutes = ['/', '/listings'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/listings');
  
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Protect tenant dashboard - redirect to home if no token or not a tenant
  if (pathname.startsWith('/tenant') && (!token || token.role !== 'TENANT')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Check for session expiration
  if (token) {
    const lastActivity = req.cookies.get('last_activity')?.value;
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds

    // Update last activity time
    const response = NextResponse.next();
    response.cookies.set('last_activity', currentTime.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TWENTY_MINUTES
    });

    // Check if session has expired due to inactivity
    if (lastActivity && (currentTime - parseInt(lastActivity)) > TWENTY_MINUTES) {
      // Clear all auth related cookies
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('next-auth.csrf-token');
      response.cookies.delete('last_activity');
      
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Handle authenticated users
    const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
    const dashboardRoutes = {
      ADMIN: '/admin/dashboard',
      LANDLORD: '/landlord/dashboard',
      USER: '/listings',
      TENANT: '/tenant/dashboard'
    };

    // Redirect from landing page to listings for authenticated users
    if (pathname === '/' && token) {
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }

    // Redirect from public routes to appropriate dashboard
    if (isPublicRoute && !['USER', 'TENANT'].includes(userRole)) {
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }

    // Check role-based access
    if (userRole === 'ADMIN' && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL(dashboardRoutes.ADMIN, req.url));
    }
    
    if (userRole === 'LANDLORD' && !pathname.startsWith('/landlord') && !isPublicRoute) {
      return NextResponse.redirect(new URL(dashboardRoutes.LANDLORD, req.url));
    }

    // Allow USER and TENANT to access public routes
    if (['USER', 'TENANT'].includes(userRole) && !isPublicRoute) {
      return NextResponse.redirect(new URL('/listings', req.url));
    }

    return response;
  }

  // Handle unauthenticated users
  if (!isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/landlord/:path*', '/listings/:path*', '/tenant/:path*'],
};