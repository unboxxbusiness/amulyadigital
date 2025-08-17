'use client';

import { useEffect } from 'react';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { usePathname, useRouter } from 'next/navigation';

async function syncSession(token: string) {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('Failed to sync session');
    }
  } catch (error) {
    console.error('Error syncing session:', error);
  }
}

export function FirebaseAuthListener() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        await syncSession(token);
      } else {
        // User is signed out. If they are on a protected route, redirect them.
        const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';
        if (!isAuthPage) {
          // This logic might need adjustment based on which routes are public
          // For now, we assume only auth pages are public when logged out.
          router.push('/sign-in');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return null; // This component does not render anything.
}
