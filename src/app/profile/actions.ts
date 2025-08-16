'use server';

import { verifySession } from "@/lib/auth/session";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

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


export async function approveLifetimeMembership(formData: FormData) {
  const session = await verifySession();
  if (session?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const uid = formData.get('uid') as string;
  if (!uid) {
    throw new Error('User ID is missing');
  }
  
  try {
    const userDocRef = adminDb.collection("users").doc(uid);
    await userDocRef.update({
      lifetimeStatus: "approved",
    });

    // Update custom claims
    const user = await adminAuth.getUser(uid);
    const existingClaims = user.customClaims || {};
    await adminAuth.setCustomUserClaims(uid, { ...existingClaims, lifetimeStatus: 'approved' });

    revalidatePath('/admin');
    revalidatePath('/profile');

  } catch (error) {
    console.error("Failed to approve lifetime membership:", error);
    // Optionally, return an error message to the client
  }
}
