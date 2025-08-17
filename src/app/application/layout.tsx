
import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) {
    redirect("/sign-in");
  }

  // This page is only for pending members.
  // Active members and admins will be redirected by the root page router.
  if (session.status !== "pending") {
      redirect("/");
  }

  return <>{children}</>;
}
