'use server';

import { verifySession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

export async function addOffer(formData: FormData) {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || !description) {
        return { error: "Title and description are required." };
    }

    try {
        await adminDb.collection('offers').add({
            title,
            description,
            createdAt: new Date().toISOString(),
        });

        revalidatePath('/admin/offers');
        revalidatePath('/offers');
        return { success: true };
    } catch (error: any) {
        return { error: "Failed to add offer." };
    }
}

export async function deleteOffer(offerId: string) {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        return { error: "Unauthorized" };
    }

    try {
        await adminDb.collection('offers').doc(offerId).delete();
        revalidatePath('/admin/offers');
        revalidatePath('/offers');
        return { success: true };
    } catch (error: any) {
        return { error: "Failed to delete offer." };
    }
}
