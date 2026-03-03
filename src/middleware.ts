import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = req.nextUrl.pathname.startsWith('/api');
  
  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages (except verify-email)
  if (isAuthPage && isLoggedIn) {
    // Allow verify-email page even when logged in
    if (req.nextUrl.pathname.startsWith('/auth/verify-email')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect all other routes (except auth pages)
  if (!isAuthPage && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
