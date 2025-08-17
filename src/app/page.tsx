import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDashboardData } from "./dashboard/actions";
import { DashboardClientPage } from "./dashboard/client-page";

export default async function MemberDashboardPage() {
  const { user, serviceRequests } = await getDashboardData();
  
  if (!user) {
    // This should be handled by the layout, but as a fallback
    redirect("/sign-in");
  }

  // This page is only for active members.
  // Admins and pending users are redirected by the root page router.
  if (user.status !== 'active') {
    redirect('/application');
  }

  return <DashboardClientPage user={user} serviceRequests={serviceRequests} />;
}
