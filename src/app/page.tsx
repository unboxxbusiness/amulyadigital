import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "./dashboard/actions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, FileText, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { logSiteVisit } from "./admin/actions";

export default async function DashboardPage() {
  const { user, serviceRequests } = await getDashboardData();
  
  if (user) {
    await logSiteVisit();
  }

  if (!user) {
    return (
       <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {/* Hero Section */}
          <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                      Empowering Communities, Changing Lives
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      Join us in our mission to bring positive change. Your support helps us provide essential resources and create a brighter future for those in need.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/contact">
                      <Button size="lg">
                        Donate Now
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button size="lg" variant="outline">
                        Become a Volunteer
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last">
                    <img
                        src="https://placehold.co/600x400.png"
                        width="600"
                        height="400"
                        alt="Happy people"
                        data-ai-hint="community volunteering"
                        className="w-full h-full object-cover"
                    />
                </div>
              </div>
            </div>
          </section>
        </main>
       </div>
    );
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
               <p className="text-xs text-muted-foreground">
                {user.lifetimeStatus === 'approved' ? 'Lifetime Member' : ''}
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
                <Link href="/profile" passHref>
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
