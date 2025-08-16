
import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  if (!session) {
    redirect("/sign-in");
  }

  if (session.role !== "member") {
    redirect("/");
  }

  return <>{children}</>;
}
