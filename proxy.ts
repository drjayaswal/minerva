import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isLoggedIn = request.cookies.get('is_logged_in')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath = 
    pathname === '/' || 
    pathname.startsWith('/minerva') || 
    pathname.startsWith('/settings');

  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL('/connect', request.url));
  }

  if (pathname === '/connect' && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/minerva/:path*', '/settings/:path*', '/connect'],
};