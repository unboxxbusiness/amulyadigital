'use server';

import { verifySession } from "@/lib/auth/session";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";
import { addYears } from 'date-fns';

export async function applyForLifetimeMembership() {
  const session = await verifySession();
  if (!session?.uid) {
    return { error: "Not authenticated" };
  }

  try {
    const userDocRef = adminDb.collection("users").doc(session.uid);
    await userDocRef.update({
      lifetimeStatus: "applied",
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to submit application." };
  }
}

export async function updateLifetimeMembership(formData: FormData) {
  const session = await verifySession();
  if (session?.role !== 'admin' && session?.role !== 'sub-admin') {
     return { error: "Unauthorized" };
  }

  const uid = formData.get('uid') as string;
  const transactionId = formData.get('transactionId') as string;
  const startDateStr = formData.get('startDate') as string;

  if (!uid || !transactionId || !startDateStr) {
    return { error: "Missing required fields." };
  }
  
  try {
    const startDate = new Date(startDateStr);
    const expiryDate = addYears(startDate, 5);

    const userDocRef = adminDb.collection("users").doc(uid);
    await userDocRef.update({
      lifetimeStatus: "approved",
      paymentTransactionId: transactionId,
      lifetimeStartDate: startDate.toISOString(),
      lifetimeExpiry: expiryDate.toISOString(),
    });

    const user = await adminAuth.getUser(uid);
    const existingClaims = user.customClaims || {};
    await adminAuth.setCustomUserClaims(uid, { ...existingClaims, lifetimeStatus: 'approved' });

    revalidatePath('/admin/lifetime');
    revalidatePath('/profile');
    revalidatePath('/');
    return { success: true };

  } catch (error: any) {
    console.error("Failed to approve lifetime membership:", error);
    return { error: "An unexpected error occurred." };
  }
}
