// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Access the session cookie
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedPath = 
    pathname === '/' || 
    pathname.startsWith('/chat') || 
    pathname.startsWith('/settings');

  // Logic: Block unauthenticated users
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/connect', request.url));
  }

  // Logic: Block authenticated users from login page
  if (pathname === '/connect' && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*', '/settings/:path*', '/connect'],
};