'use server';

import 'server-only';
import {cookies} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';
import { adminAuth } from '@/lib/firebase/admin-app';

const secretKey = process.env.SESSION_SECRET || 'your-secret-key';
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload).setProtectedHeader({alg: 'HS256'}).setIssuedAt().setExpirationTime('7d').sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const {payload} = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log('Failed to verify session');
    return null;
  }
}

export async function createSession(uid: string) {
  const user = await adminAuth.getUser(uid);
  const role = user.customClaims?.role || 'member';
  const status = user.customClaims?.status || 'pending';

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionPayload = {
    uid,
    role,
    status,
    expires: expires.toISOString(),
  };

  const session = await encrypt(sessionPayload);

  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export async function getSession() {
  const session = cookies().get('session')?.value;
  return await decrypt(session);
}

export async function deleteSession() {
  cookies().set('session', '', {expires: new Date(0)});
}

export async function verifySession() {
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.uid) {
    return null;
  }
  return session;
}
