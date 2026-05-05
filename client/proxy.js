import { NextResponse } from 'next/server';

export function proxy(req) {
  const token = req.cookies.get('accessToken');
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (pathname === '/checkout' && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  if (
    (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) &&
    token
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/checkout', '/orders/:path*'],
};
