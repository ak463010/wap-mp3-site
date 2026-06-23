import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow login page and static files
  if (pathname === '/admin/login' || pathname.match(/\.(css|js|png|jpg|svg|ico)$/)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Cookie exists — assume valid (API routes verify it anyway)
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
