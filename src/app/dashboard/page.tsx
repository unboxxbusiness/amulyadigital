import { getDashboardData } from "./actions";
import { DashboardClientPage } from "./client-page";

export default async function MemberDashboardPage() {
  const { user, serviceRequests } = await getDashboardData();
  
  // The layout will redirect if there's no user, but this is a fallback.
  if (!user) {
    return null;
  }

  return <DashboardClientPage user={user} serviceRequests={serviceRequests} />;
}
