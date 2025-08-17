import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function RootPageRouter() {
  const session = await verifySession();

  if (!session) {
    redirect("/sign-in");
  }

  if (session.role === "admin" || session.role === "sub-admin") {
    redirect("/admin");
  }

  if (session.status === "pending") {
    redirect("/application");
  }
  
  if (session.status === "active") {
    redirect("/dashboard");
  }

  // Fallback for any other case
  redirect("/sign-in");
}
