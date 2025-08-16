
'use server';

import { verifySession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

export async function applyForService(formData: FormData) {
  const session = await verifySession();
  if (!session?.uid) {
    return { error: "Not authenticated" };
  }

  const serviceName = formData.get('serviceName') as string;
  if (!serviceName) {
    return { error: "Service name is required." };
  }

  try {
    await adminDb.collection("serviceRequests").add({
      uid: session.uid, // Add uid to the service request
      serviceName,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    revalidatePath('/services');
    revalidatePath('/'); // Revalidate dashboard page
    return { success: true, message: "Application submitted successfully." };
  } catch (error: any) {
    return { error: "Failed to submit application." };
  }
}

export async function getMemberServiceRequests() {
  const session = await verifySession();
  if (!session?.uid) {
    return [];
  }
  
  const snapshot = await adminDb.collection('serviceRequests')
    .where('uid', '==', session.uid)
    .orderBy('createdAt', 'desc')
    .get();
    
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


// Admin Actions
export async function getAllServiceRequests() {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        return [];
    }

    const snapshot = await adminDb.collection('serviceRequests').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateServiceRequestStatus(formData: FormData) {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return { error: "Unauthorized" };
    }
    const requestId = formData.get('requestId') as string;
    const status = formData.get('status') as 'approved' | 'rejected';

    if (!requestId || !status) {
        return { error: "Missing request ID or status." };
    }

    try {
        await adminDb.collection('serviceRequests').doc(requestId).update({ status });
        revalidatePath('/admin/services');
        revalidatePath('/services');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status." };
    }
}

export async function updateServiceRequestsStatus(requestIds: string[], status: 'approved' | 'rejected') {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return { error: "Unauthorized" };
    }
    if (!requestIds || requestIds.length === 0) {
        return { error: 'No requests selected.' };
    }

    try {
        const batch = adminDb.batch();
        requestIds.forEach(id => {
            const docRef = adminDb.collection('serviceRequests').doc(id);
            batch.update(docRef, { status });
        });
        await batch.commit();
        revalidatePath('/admin/services');
        revalidatePath('/services');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Error updating requests:", error);
        return { error: 'Failed to update requests.' };
    }
}

export async function deleteServiceRequests(requestIds: string[]) {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return { error: "Unauthorized" };
    }
    if (!requestIds || requestIds.length === 0) {
        return { error: 'No requests selected.' };
    }

    try {
        const batch = adminDb.batch();
        requestIds.forEach(id => {
            const docRef = adminDb.collection('serviceRequests').doc(id);
            batch.delete(docRef);
        });
        await batch.commit();
        revalidatePath('/admin/services');
        return { success: true };
    } catch (error) {
        console.error("Error deleting requests:", error);
        return { error: 'Failed to delete requests.' };
    }
}
