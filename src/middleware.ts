import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {decrypt} from '@/lib/auth/session';
import {adminAuth} from '@/lib/firebase/admin-app';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const decryptedSession = await decrypt(sessionCookie);
  const user = decryptedSession?.uid ? await adminAuth.getUser(decryptedSession.uid as string) : null;
  const userRole = user?.customClaims?.role;
  const userStatus = user?.customClaims?.status;

  const {pathname} = request.nextUrl;

  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  if (isAuthPage) {
    if (user) {
      return NextResponse.redirect(new URL(userRole === 'admin' ? '/admin' : '/', request.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (userStatus !== 'active' && pathname !== '/application') {
    return NextResponse.redirect(new URL('/application', request.url));
  }

  if (userRole === 'admin' && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (userRole !== 'admin' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/profile', '/application', '/', '/sign-in', '/sign-up'],
};
