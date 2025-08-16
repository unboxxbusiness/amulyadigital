'use server';
import 'server-only';
import { adminDb } from '@/lib/firebase/admin-app';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/auth/session';

export async function deleteMessages(messageIds: string[]) {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return { error: 'Unauthorized' };
    }

    if (!messageIds || messageIds.length === 0) {
        return { error: 'No messages selected.' };
    }

    try {
        const batch = adminDb.batch();
        messageIds.forEach(id => {
            const docRef = adminDb.collection('contactSubmissions').doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
        revalidatePath('/admin/inbox');
        return { success: true };
    } catch (error) {
        console.error("Error deleting messages:", error);
        return { error: 'Failed to delete messages.' };
    }
}
