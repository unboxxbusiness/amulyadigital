import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  
  // Protect this route from unauthenticated users
  if (!session) {
    redirect("/sign-in");
  }

  // This layout is for active members.
  // Admins are redirected by the root page router.
  // Pending users are redirected by the root page router.
  if (session.status !== "active" || session.role !== "member") {
    redirect("/");
  }

  return <>{children}</>;
}
