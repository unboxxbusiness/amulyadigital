'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, FileText, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { logSiteVisit } from "@/app/admin/actions";
import { format } from 'date-fns';
import { useEffect } from "react";
import type { getDashboardData } from "./actions";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export function DashboardClientPage({ user, serviceRequests }: DashboardData) {
  useEffect(() => {
    // Log site visit only on the client side
    logSiteVisit();
  }, []);

  if (!user) {
    return null; // Or a loading state, though the parent page should redirect
  }
  
  const approvedRequests = serviceRequests.filter(req => req.status === 'approved').length;
  const pendingRequests = serviceRequests.filter(req => req.status === 'pending').length;
  const recentRequests = serviceRequests.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, {user.displayName || 'Member'}!</h1>
        <p className="text-muted-foreground">Here's a summary of your membership and activities.</p>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                 <Badge className="text-lg bg-accent text-accent-foreground">{user.status === 'active' ? 'Batch Member' : 'Pending'}</Badge>
              </div>
               <p className="text-xs text-muted-foreground mt-1">
                {user.lifetimeStatus === 'approved' && user.lifetimeExpiry
                    ? `Lifetime Member (Expires: ${format(new Date(user.lifetimeExpiry), "PPP")})`
                    : ''
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services Used</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedRequests}</div>
              <p className="text-xs text-muted-foreground">Total services approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Services currently pending approval</p>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Activity & Notifications</CardTitle>
                <CardDescription>
                    Here are the latest updates on your service requests.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {recentRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">You have no recent activity.</TableCell>
                            </TableRow>
                        ) : (
                            recentRequests.map((req: any) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.serviceName}</TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            req.status === "pending" ? "secondary" : 
                                            req.status === "approved" ? "default" : "destructive"
                                        }
                                        className={req.status === "approved" ? "bg-accent text-accent-foreground" : ""}
                                        >
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Membership Details</CardTitle>
                <CardDescription>Your personal and membership information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{user.displayName}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Member ID</p>
                    <p>{user.memberId || "N/A"}</p>
                </div>
                <Link href="/settings" passHref>
                    <Button variant="outline" className="w-full">
                        View & Edit Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                 <Link href="/services" passHref>
                    <Button className="w-full">
                        Apply for Services
                        <FileText className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
