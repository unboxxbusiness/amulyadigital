'use server';
import {adminAuth, adminDb} from '@/lib/firebase/admin-app';
import {createSession} from '@/lib/auth/session';
import {deleteSession} from '@/lib/auth/session-edge';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';

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

    await createSession(userRecord.uid);
    revalidatePath('/');
    redirect(isSuperAdmin ? '/admin' : '/application');
  } catch (error: any) {
    return {error: error.message};
  }
}

export async function createSessionAction(uid: string) {
  try {
    await createSession(uid);
    const user = await adminAuth.getUser(uid);
    const role = user.customClaims?.role;
    revalidatePath('/');
    const redirectPath = role === 'admin' ? '/admin' : '/';
    return {redirectPath};
  } catch (error: any) {
    return {error: error.message};
  }
}

export async function signOut() {
  await deleteSession();
  revalidatePath('/');
  redirect('/sign-in');
}
