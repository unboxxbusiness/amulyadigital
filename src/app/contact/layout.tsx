
import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
