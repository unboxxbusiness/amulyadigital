'use server';
import {adminAuth} from '@/lib/firebase/admin-app';
import {createSession} from '@/lib/auth/session';
import {redirect} from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      disabled: false,
    });

    const isSuperAdmin = email === process.env.SUPER_ADMIN_EMAIL;
    const role = isSuperAdmin ? 'admin' : 'member';
    const status = isSuperAdmin ? 'active' : 'pending';

    await adminAuth.setCustomUserClaims(userRecord.uid, {role, status});

    if (isSuperAdmin) {
      const superAdminUsers = await adminAuth.listUsers();
      const superAdmins = superAdminUsers.users.filter(user => user.customClaims?.role === 'admin' && user.email !== email);
      if (superAdmins.length > 0) {
        await adminAuth.deleteUser(userRecord.uid);
        return {error: 'A super admin already exists.'};
      }
    }

    await createSession(userRecord.uid);
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
    redirect(role === 'admin' ? '/admin' : '/');
  } catch (error: any) {
    return {error: error.message};
  }
}

export async function signOut() {
  await createSession('');
  redirect('/sign-in');
}
