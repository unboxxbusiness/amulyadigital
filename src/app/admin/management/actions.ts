'use server';

import { verifySession } from "@/lib/auth/session";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

export async function createSubAdmin(formData: FormData) {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        return { error: "Unauthorized: Only Super Admins can create sub-admins." };
    }

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: "Email and password are required." };
    }

    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            disabled: false,
        });

        const role = 'sub-admin';
        const status = 'active';

        await adminAuth.setCustomUserClaims(userRecord.uid, { role, status });

        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: email.split('@')[0],
            role: role,
            status: status,
            createdAt: new Date().toISOString(),
        });

        revalidatePath('/admin/management');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
