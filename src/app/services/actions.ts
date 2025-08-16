
'use server';

import { verifySession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

export async function applyForService(formData: FormData) {
  const session = await verifySession();
  if (!session?.uid || !session.memberId) {
    return { error: "Not authenticated or missing Member ID." };
  }

  const serviceName = formData.get('serviceName') as string;
  if (!serviceName) {
    return { error: "Service name is required." };
  }

  try {
    await adminDb.collection("serviceRequests").add({
      uid: session.uid,
      memberId: session.memberId,
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
export async function getServiceRequestsWithUserDetails() {
    const session = await verifySession();
    if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
        return [];
    }

    const requestsSnapshot = await adminDb.collection('serviceRequests').orderBy('createdAt', 'desc').get();
    if (requestsSnapshot.empty) {
        return [];
    }

    const userIds = [...new Set(requestsSnapshot.docs.map(doc => doc.data().uid))];
    
    if (userIds.length === 0) {
        return [];
    }

    const usersSnapshot = await adminDb.collection('users').where('uid', 'in', userIds).get();
    const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));

    return requestsSnapshot.docs.map(doc => {
        const requestData = doc.data();
        const userData = usersMap.get(requestData.uid);
        return {
            id: doc.id,
            uid: requestData.uid,
            name: userData?.displayName || 'N/A',
            email: userData?.email || 'N/A',
            memberId: requestData.memberId || 'N/A',
            serviceName: requestData.serviceName,
            createdAt: requestData.createdAt,
            status: requestData.status,
        };
    });
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
