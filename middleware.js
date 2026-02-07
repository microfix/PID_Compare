import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Nicolai-ønske:
// - pid.appfix.org skal være PID Compare
// - hvis man IKKE er logget ind (SSO), så skal pid sende en til da (ikke db, ikke en "klik login"-side)
// - når man ER logget ind, så skal PID Compare virke direkte
export async function middleware(req) {
  const { pathname } = req.nextUrl;

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

  // Ikke logget ind → send til dashboardet (da auto-kicker SSO flow)
  return NextResponse.redirect('https://da.appfix.org/', 307);
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
