'use server';

import 'server-only';
import {cookies} from 'next/headers';
import {SignJWT, jwtVerify} from 'jose';

const secretKey = process.env.SESSION_SECRET;
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
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({uid, expires});

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
  cookies().delete('session');
}
