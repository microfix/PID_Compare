import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Auto-login middleware:
// - Hvis ingen session -> send direkte til Authentik provider (ingen "klik login")
// - Ellers lad request fortsætte
export async function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Lad NextAuth endpoints og statics være
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  const callbackUrl = encodeURIComponent(`${pathname}${search || ''}`);
  const url = req.nextUrl.clone();
  url.pathname = '/api/auth/signin/authentik';
  url.search = `callbackUrl=${callbackUrl}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
