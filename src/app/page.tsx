import { getDashboardData } from "./dashboard/actions";
import { redirect } from "next/navigation";
import { DashboardClientPage } from "./dashboard/client-page";

export default async function DashboardPage() {
  const { user, serviceRequests } = await getDashboardData();
  
  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardClientPage user={user} serviceRequests={serviceRequests} />;
}
