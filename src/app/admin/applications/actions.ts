'use server';

import { revalidatePath } from "next/cache";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { FieldValue } from "firebase-admin/firestore";

export async function approveUser(uid: string) {
    const counterRef = adminDb.collection('counters').doc('memberIdCounter');
    const userRef = adminDb.collection('users').doc(uid);

    await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let newCount;
        if (!counterDoc.exists) {
            newCount = 1;
        } else {
            const currentYear = new Date().getFullYear();
            const lastResetYear = counterDoc.data()?.lastResetYear || 0;
            if (currentYear > lastResetYear) {
                newCount = 1;
                transaction.set(counterRef, { count: newCount, lastResetYear: currentYear }, { merge: true });
            } else {
                newCount = (counterDoc.data()?.count || 0) + 1;
            }
        }
        
        const year = new Date().getFullYear();
        const memberId = `NGO-${year}-${String(newCount).padStart(4, '0')}`;
        
        transaction.update(userRef, { 
            status: 'active',
            memberId: memberId,
        });

        if (counterDoc.exists) {
            transaction.update(counterRef, { count: FieldValue.increment(1) });
        } else {
            transaction.set(counterRef, { count: newCount, lastResetYear: year });
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
