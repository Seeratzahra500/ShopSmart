import { NextResponse } from 'next/server';

export function middleware(req) {
  const token = req.cookies.get('accessToken');
  const { pathname } = req.nextUrl;

  if (pathname === '/checkout' && !token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout'],
};
