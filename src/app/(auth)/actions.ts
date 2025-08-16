'use server';
import {adminAuth} from '@/lib/firebase/admin-app';
import {createSession} from '@/lib/auth/session';
import {deleteSession} from '@/lib/auth/session-edge';
import {redirect} from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const superAdminUsers = await adminAuth.listUsers();
    const superAdmins = superAdminUsers.users.filter(user => user.customClaims?.role === 'admin');
    const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;

    if (isSuperAdmin && superAdmins.length > 0) {
      return {error: 'A super admin already exists.'};
    }
    
    const userRecord = await adminAuth.createUser({
      email,
      password,
      disabled: false,
    });

    const role = isSuperAdmin ? 'admin' : 'member';
    const status = isSuperAdmin ? 'active' : 'pending';

    await adminAuth.setCustomUserClaims(userRecord.uid, {role, status});

    await createSession(userRecord.uid);
    revalidatePath('/');
    redirect(isSuperAdmin ? '/admin' : '/application');
  } catch (error: any) {
    return {error: error.message};
  }
}

export async function signInWithIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    await createSession(decodedToken.uid);
    const user = await adminAuth.getUser(decodedToken.uid);
    const role = user.customClaims?.role;
    revalidatePath('/');
    redirect(role === 'admin' ? '/admin' : '/');
  } catch (error: any) {
    return {error: error.message};
  }
}

export async function signOut() {
  await deleteSession();
  revalidatePath('/');
  redirect('/sign-in');
}
