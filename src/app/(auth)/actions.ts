
'use server';
import {UserCredential} from 'firebase/auth';
import {adminAuth, adminDb} from '@/lib/firebase/admin-app';
import {createSession} from '@/lib/auth/session';
import {deleteSession} from '@/lib/auth/session-edge';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const superAdminUsers = await adminDb.collection('users').where('role', '==', 'admin').get();
    const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;
    
    if (isSuperAdmin && !superAdminUsers.empty) {
      return {error: 'A super admin already exists.'};
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      disabled: false,
    });

    const role = isSuperAdmin ? 'admin' : 'member';
    const status = isSuperAdmin ? 'active' : 'pending';
    const claims = {role, status, memberId: null};

    await adminAuth.setCustomUserClaims(userRecord.uid, claims);

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || email.split('@')[0],
      role: role,
      status: status,
      createdAt: new Date().toISOString(),
      portfolioUrl: '',
      bio: '',
    });

    await createSession(userRecord.uid, claims);
    revalidatePath('/');
    
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return {error: error.message};
  }

  const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;
  redirect(isSuperAdmin ? '/admin' : '/application');
}

export async function signInWithGoogle(user: UserCredential['user']) {
  try {
    const {uid, email, displayName, photoURL} = user;
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    let claims: { role: string; status: string; memberId: string | null };

    if (userDoc.exists) {
        const existingData = userDoc.data();
        claims = {
            role: existingData?.role || 'member',
            status: existingData?.status || 'pending',
            memberId: existingData?.memberId || null
        };
    } else {
        const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;
        const superAdminUsers = await adminDb.collection('users').where('role', '==', 'admin').get();

        let role: string;
        let status: string;

        if (isSuperAdmin && !superAdminUsers.empty) {
            role = 'member';
            status = 'pending';
        } else {
            role = isSuperAdmin ? 'admin' : 'member';
            status = isSuperAdmin ? 'active' : 'pending';
        }

        claims = { role, status, memberId: null };

        await userDocRef.set({
            uid,
            email,
            displayName: displayName || email?.split('@')[0],
            photoURL: photoURL || '',
            role: claims.role,
            status: claims.status,
            createdAt: new Date().toISOString(),
            portfolioUrl: '',
            bio: '',
        }, { merge: true });

        await adminAuth.setCustomUserClaims(uid, { role: claims.role, status: claims.status });
    }

    await createSession(uid, claims);
    revalidatePath('/');

    const redirectPath = claims.role === 'admin' ? '/admin' : claims.status === 'pending' ? '/application' : '/';
    return { redirectPath };

  } catch (error: any) {
    console.error('Error in signInWithGoogle:', error);
    return {error: 'An error occurred during Google Sign-In.'};
  }
}

export async function signOut() {
  await deleteSession();
  revalidatePath('/');
  redirect('/sign-in');
}
