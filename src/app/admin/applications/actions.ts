'use server';

import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";

export async function approveUser(uid: string) {
    const counterRef = adminDb.collection('counters').doc('memberIdCounter');
    const userRef = adminDb.collection('users').doc(uid);

    await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let newCount;
        let prefix = 'NGO';
        const currentYear = new Date().getFullYear();

        if (!counterDoc.exists) {
            newCount = 1;
        } else {
            const data = counterDoc.data()!;
            prefix = data.prefix || 'NGO';
            const lastResetYear = data.lastResetYear || 0;
            if (currentYear > lastResetYear) {
                newCount = 1;
                 transaction.set(counterRef, { count: 0, lastResetYear: currentYear }, { merge: true });
            } else {
                newCount = (data.count || 0) + 1;
            }
        }
        
        const memberId = `${prefix}-${currentYear}-${String(newCount).padStart(4, '0')}`;
        
        transaction.update(userRef, { 
            status: 'active',
            memberId: memberId,
        });

        if (counterDoc.exists) {
            transaction.update(counterRef, { count: newCount, lastResetYear: currentYear });
        } else {
            transaction.set(counterRef, { count: newCount, prefix: prefix, lastResetYear: currentYear });
        }
    });

    await adminAuth.setCustomUserClaims(uid, { role: 'member', status: 'active' });
    revalidatePath('/admin/applications');
}

export async function rejectUser(uid: string) {
    await adminDb.collection('users').doc(uid).delete();
    await adminAuth.deleteUser(uid);
    revalidatePath('/admin/applications');
}


export async function approveUsers(uids: string[]) {
    if (!uids || uids.length === 0) {
        return { error: 'No users selected.' };
    }
    try {
        // We approve users one by one to ensure the memberId transaction is safe.
        for (const uid of uids) {
            await approveUser(uid);
        }
        revalidatePath('/admin/applications');
        return { success: true };
    } catch (error) {
        console.error("Error approving users in bulk:", error);
        return { error: 'Failed to approve all selected users.' };
    }
}

export async function rejectUsers(uids: string[]) {
    if (!uids || uids.length === 0) {
        return { error: 'No users selected.' };
    }
    try {
        const batch = adminDb.batch();
        for (const uid of uids) {
            const userRef = adminDb.collection('users').doc(uid);
            batch.delete(userRef);
        }
        await batch.commit();

        // Deleting from Auth must be done one by one
        for (const uid of uids) {
            await adminAuth.deleteUser(uid);
        }

        revalidatePath('/admin/applications');
        return { success: true };
    } catch (error) {
        console.error("Error rejecting users in bulk:", error);
        return { error: 'Failed to reject all selected users.' };
    }
}
