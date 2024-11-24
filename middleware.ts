import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Define allowed public routes
  const publicRoutes = ['/', '/listings'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/listings');
  
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // Handle expired token
    if (token?.exp) {
      const expiryTime = Number(token.exp) * 1000; // Convert to number explicitly
      const currentTime = Date.now();
      
      if (currentTime > expiryTime) {
        console.log('Token expired in middleware:', {
          current: new Date(currentTime).toISOString(),
          expiry: new Date(expiryTime).toISOString(),
          timeLeft: Math.floor((expiryTime - currentTime) / 1000),
        });
        
        // Clear any existing cookies
        const response = NextResponse.redirect(new URL('/?sessionExpired=true', req.url));
        response.cookies.delete('next-auth.session-token');
        response.cookies.delete('next-auth.csrf-token');
        response.cookies.delete('next-auth.callback-url');
        return response;
      }
    }

    if (!token) {
      if (!isPublicRoute) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      return NextResponse.next();
    }

    const userRole = token.role as 'ADMIN' | 'LANDLORD' | 'USER' | 'TENANT';
    const dashboardRoutes = {
      ADMIN: '/admin/dashboard',
      LANDLORD: '/landlord/dashboard',
      USER: '/listings',
      TENANT: '/dashboard'
    };

    // Redirect from landing page
    if (pathname === '/') {
      return NextResponse.redirect(new URL(dashboardRoutes[userRole], req.url));
    }

    // Role-based access control
    switch (userRole) {
      case 'ADMIN':
        if (!pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL(dashboardRoutes.ADMIN, req.url));
        }
        break;
        
      case 'LANDLORD':
        if (!pathname.startsWith('/landlord') && !isPublicRoute) {
          return NextResponse.redirect(new URL(dashboardRoutes.LANDLORD, req.url));
        }
        break;
        
      case 'TENANT':
        if (!pathname.startsWith('/dashboard') && !isPublicRoute) {
          return NextResponse.redirect(new URL(dashboardRoutes.TENANT, req.url));
        }
        break;
        
      case 'USER':
        if (!isPublicRoute) {
          return NextResponse.redirect(new URL(dashboardRoutes.USER, req.url));
        }
        break;
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/landlord/:path*', '/listings/:path*', '/tenant/:path*', '/dashboard'],
};