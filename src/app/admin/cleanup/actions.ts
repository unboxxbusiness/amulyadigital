
'use server';
import 'server-only';

import { verifySession } from "@/lib/auth/session";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";

const BATCH_SIZE = 500;

async function deleteCollection(query: FirebaseFirestore.Query) {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    let deletedCount = 0;
    let snapshot = await query.limit(BATCH_SIZE).get();

    while (snapshot.size > 0) {
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        deletedCount += snapshot.size;
        snapshot = await query.limit(BATCH_SIZE).get();
    }
    return deletedCount;
}


export async function deleteOldSiteVisits() {
    try {
        const ninetyDaysAgo = subDays(new Date(), 90).toISOString();
        const query = adminDb.collection('siteVisits').where('timestamp', '<=', ninetyDaysAgo);
        const count = await deleteCollection(query);
        return { success: true, message: `Successfully deleted ${count} old site visit logs.` };
    } catch (error: any) {
        console.error("Error deleting old site visits:", error);
        return { error: error.message || "Failed to delete old site visits." };
    }
}

export async function deleteOldContactMessages() {
    try {
        const ninetyDaysAgo = subDays(new Date(), 90).toISOString();
        const query = adminDb.collection('contactSubmissions').where('submittedAt', '<=', ninetyDaysAgo);
        const count = await deleteCollection(query);
        revalidatePath('/admin/inbox');
        return { success: true, message: `Successfully deleted ${count} old contact messages.` };
    } catch (error: any) {
        console.error("Error deleting old contact messages:", error);
        return { error: error.message || "Failed to delete old contact messages." };
    }
}


export async function deleteOldPendingMembers() {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    try {
        const ninetyDaysAgo = subDays(new Date(), 90).toISOString();
        const query = adminDb.collection('users')
            .where('status', '==', 'pending')
            .where('createdAt', '<=', ninetyDaysAgo);
        
        const snapshot = await query.get();
        if (snapshot.empty) {
            return { success: true, message: "No old pending members found to delete." };
        }

        let deletedCount = 0;
        const uidsToDelete: string[] = [];

        // First, delete from Firestore
        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
            uidsToDelete.push(doc.id);
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Then, delete from Firebase Auth
        for (const uid of uidsToDelete) {
            try {
                await adminAuth.deleteUser(uid);
                deletedCount++;
            } catch (authError) {
                console.error(`Failed to delete user ${uid} from Auth:`, authError);
                // Continue even if one fails
            }
        }
        
        revalidatePath('/admin/applications');
        return { success: true, message: `Successfully deleted ${deletedCount} old pending members.` };
    } catch (error: any) {
        console.error("Error deleting old pending members:", error);
        return { error: error.message || "Failed to delete old pending members." };
    }
}
