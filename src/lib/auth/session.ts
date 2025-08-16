'use server';

import 'server-only';
import { adminAuth } from '@/lib/firebase/admin-app';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from './session-edge';

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

export async function verifySession() {
  const cookie = cookies().get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.uid) {
    return null;
  }
  return session;
}
