import { NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/admin'];
const publicRoutes = ['/admin/login'];

export default async function proxy(request) {
  const path = request.nextUrl.pathname;

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route)) && !publicRoutes.includes(path);

  if (isProtectedRoute) {
    const cookie = request.cookies.get('admin_session')?.value;
    const session = await decrypt(cookie);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
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
