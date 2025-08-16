'use server';

import { verifySession } from "@/lib/auth/session";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(formData: FormData) {
    const session = await verifySession();
    if (!session?.uid) {
        return { error: "Not authenticated" };
    }

    const displayName = formData.get('displayName') as string;

    try {
        await adminAuth.updateUser(session.uid, { displayName });
        await adminDb.collection('users').doc(session.uid).update({ displayName });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { error: "Failed to update profile." };
    }
}

export async function getMembershipIdCounter() {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    const counterRef = adminDb.collection('counters').doc('memberIdCounter');
    const counterDoc = await counterRef.get();

    if (!counterDoc.exists) {
        return { prefix: 'NGO', nextNumber: 1 };
    }

    const data = counterDoc.data();
    return {
        prefix: data?.prefix || 'NGO',
        nextNumber: (data?.count || 0) + 1,
    };
}

export async function updateMembershipIdCounter(formData: FormData) {
     const session = await verifySession();
    if (session?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    const prefix = formData.get('prefix') as string;
    const nextNumber = parseInt(formData.get('nextNumber') as string, 10);

    if (!prefix || isNaN(nextNumber)) {
        return { error: "Invalid input." };
    }

    const counterRef = adminDb.collection('counters').doc('memberIdCounter');
    try {
        await counterRef.set({
            prefix: prefix,
            count: nextNumber - 1, // Store the last used number
            lastResetYear: new Date().getFullYear(),
        }, { merge: true });

        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { error: "Failed to update settings." };
    }
}
