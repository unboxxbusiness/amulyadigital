'use server';

import { verifySession } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";

export async function submitContactForm(formData: FormData) {
  const session = await verifySession();
  if (!session?.uid) {
    return { error: "Not authenticated" };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const category = formData.get('category') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !category || !message) {
    return { error: "All fields are required." };
  }

  try {
    await adminDb.collection("contactSubmissions").add({
      uid: session.uid,
      name,
      email,
      category,
      message,
      submittedAt: new Date().toISOString(),
      status: "new", // 'new', 'read', 'archived'
    });
    
    revalidatePath('/admin/inbox');

    return { success: true, message: "Your message has been sent successfully." };
  } catch (error: any) {
    return { error: "Failed to send message. Please try again later." };
  }
}
