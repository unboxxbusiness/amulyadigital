import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {jwtVerify} from 'jose';

const secretKey = process.env.SESSION_SECRET || 'your-secret-key';
const encodedKey = new TextEncoder().encode(secretKey);

async function decrypt(session: string | undefined = '') {
  try {
    const {payload} = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  const session = await decrypt(sessionCookie);

  const {pathname} = request.nextUrl;
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  const isAdminPage = pathname.startsWith('/admin');
  const isApplicationPage = pathname.startsWith('/application');
  const isMemberPage = !isAdminPage && !isApplicationPage && !isAuthPage;

  if (isAuthPage) {
    if (session?.uid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!session?.uid) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  const {role, status} = session;

  if (isAdminPage && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isApplicationPage && status === 'active') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isMemberPage && role === 'member' && status !== 'active') {
    return NextResponse.redirect(new URL('/application', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
