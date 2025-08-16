
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

  if (session.status === "active") {
      redirect("/");
  }

  return <>{children}</>;
}
