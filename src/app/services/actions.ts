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
    const userDoc = await adminDb.collection('users').doc(session.uid).get();
    if (!userDoc.exists) {
        return { error: "User not found." };
    }
    const memberId = userDoc.data()?.memberId;

    await adminDb.collection("serviceRequests").add({
      memberId: memberId || session.uid,
      serviceName,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    revalidatePath('/services');
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
   const userDoc = await adminDb.collection('users').doc(session.uid).get();
    if (!userDoc.exists) {
        return [];
    }
  const memberId = userDoc.data()?.memberId;

  const snapshot = await adminDb.collection('serviceRequests').where('memberId', '==', memberId || session.uid).orderBy('createdAt', 'desc').get();
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
    if (session?.role !== 'admin') {
        return { error: "Unauthorized" };
    }
    const requestId = formData.get('requestId') as string;
    const status = formData.get('status') as 'approved' | 'rejected';

    if (!requestId || !status) {
        return { error: "Missing request ID or status." };
    }

    try {
        await adminDb.collection('serviceRequests').doc(requestId).update({ status });
        revalidatePath('/admin');
        revalidatePath('/services');
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status." };
    }
}
