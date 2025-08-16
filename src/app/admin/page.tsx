import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, FileText, Users } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin-app";
import { getAllServiceRequests } from "../services/actions";

async function getStats() {
    const usersSnapshot = await adminDb.collection('users').where('role', '==', 'member').get();
    const activeMembers = usersSnapshot.docs.filter(doc => doc.data().status === 'active').length;
    const lifetimeApplications = usersSnapshot.docs.filter(doc => doc.data().lifetimeStatus === 'applied').length;
    const serviceRequests = await getAllServiceRequests();

    return {
        totalMembers: activeMembers,
        lifetimeApplicationsCount: lifetimeApplications.length,
        serviceRequestsCount: serviceRequests.length,
    }
}


export default async function AdminDashboardPage() {
  const { totalMembers, lifetimeApplicationsCount, serviceRequestsCount } = await getStats();

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your organization's key metrics.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">Currently active members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Upgrades</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lifetimeApplicationsCount}</div>
              <p className="text-xs text-muted-foreground">Pending lifetime membership requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceRequestsCount}</div>
              <p className="text-xs text-muted-foreground">Total service applications</p>
            </CardContent>
          </Card>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Welcome to the Admin Dashboard</CardTitle>
            <CardDescription>
                Use the sidebar navigation to manage different aspects of your organization. You can review membership applications, handle service requests, and manage administrative users.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p>This central dashboard provides a quick overview of your community's activity. As your organization grows, you'll see these numbers reflect that growth.</p>
        </CardContent>
      </Card>

    </div>
  )
}
