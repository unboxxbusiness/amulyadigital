'use server';

import 'server-only';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from './session-edge';
import { adminAuth } from '@/lib/firebase/admin-app';

type Claims = {
  role: string;
  status: string;
  memberId: string | null;
};

export async function createSession(uid: string, claims: Claims) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionPayload = {
    uid,
    role: claims.role,
    status: claims.status,
    memberId: claims.memberId,
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

export async function refreshSession() {
  const session = await verifySession();
  if (!session) return;
  
  const user = await adminAuth.getUser(session.uid);
  const claims = {
    role: user.customClaims?.role || 'member',
    status: user.customClaims?.status || 'pending',
    memberId: user.customClaims?.memberId || null,
  };
  
  await createSession(user.uid, claims);
}
