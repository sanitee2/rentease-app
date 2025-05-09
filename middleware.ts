import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Define allowed public routes
  const publicRoutes = ['/', '/listings'];
  const isPublicRoute = publicRoutes.includes(pathname) || 
    pathname.startsWith('/listings');
  
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production'
    });

    // Debug logging for production issues
    if (process.env.NODE_ENV === 'production') {
      console.log('Middleware Debug:', {
        pathname,
        hasToken: !!token,
        tokenRole: token?.role,
        isPublicRoute
      });
    }

    // If no token and trying to access protected route, redirect to home
    if (!token && !isPublicRoute) {
      console.log('No token found, redirecting to home');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If token exists, handle role-based routing
    if (token) {
      const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
      
      // Debug log the role-based routing
      if (process.env.NODE_ENV === 'production') {
        console.log('Role-based routing:', {
          userRole,
          pathname,
          shouldRedirect: pathname === '/'
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
        console.log(`Redirecting to dashboard: ${redirectUrl.pathname}`);
        return NextResponse.redirect(redirectUrl);
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
        const redirectUrl = new URL(dashboardRoutes[userRole], req.url);
        console.log(`Invalid route access, redirecting to: ${redirectUrl.pathname}`);
        return NextResponse.redirect(redirectUrl);
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
    '/', 
    '/listings', 
    '/listings/:path*', 
    '/admin/:path*', 
    '/landlord/:path*', 
    '/tenant/:path*', 
    '/dashboard'
  ],
};