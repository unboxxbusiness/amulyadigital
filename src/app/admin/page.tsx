import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Eye, FileText, Users } from "lucide-react";
import { getStats } from "./actions";
import { MembersChart } from "./members-chart";
import { RequestsChart } from "./requests-chart";

export default async function AdminDashboardPage() {
  const { 
    totalMembers, 
    lifetimeApplicationsCount, 
    serviceRequestsCount,
    siteVisitsCount,
    allMembersData,
    serviceRequestsData,
  } = await getStats();

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your organization's key metrics.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">Site Visits</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{siteVisitsCount}</div>
              <p className="text-xs text-muted-foreground">Total site visits</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MembersChart allMembersData={JSON.parse(JSON.stringify(allMembersData))} />
        <RequestsChart serviceRequestsData={serviceRequestsData} />
      </div>

    </div>
  )
}
