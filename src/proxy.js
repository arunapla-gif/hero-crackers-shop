import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/admin'];
const publicRoutes = ['/admin/login'];

export default async function proxy(request) {
  const path = request.nextUrl.pathname;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route)) && !publicRoutes.includes(path);

  const cookie = request.cookies.get('admin_session')?.value;
  const session = cookie ? await decrypt(cookie) : null;
  const isAuthenticatedAdmin = session && session.user && session.user.role === 'ADMIN';

  if (isProtectedRoute) {
    if (!isAuthenticatedAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // If already logged in as admin, redirect from login page to dashboard
  if (path === '/admin/login' && isAuthenticatedAdmin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
