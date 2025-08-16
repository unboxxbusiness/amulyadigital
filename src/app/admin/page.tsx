import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Crown, UserPlus, Users, BarChart, FileText } from "lucide-react";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";
import { approveLifetimeMembership } from "@/app/profile/actions";
import { FieldValue } from "firebase-admin/firestore";
import { updateServiceRequestStatus, getAllServiceRequests } from "../services/actions";
import { verifySession } from "@/lib/auth/session";
import { createSubAdmin } from "./actions";

type Application = {
    uid: string;
    name: string;
    email: string;
    submitted: Date;
    status: string;
    lifetimeStatus?: 'not_applied' | 'applied' | 'approved';
}

type AdminUser = {
    uid: string;
    email: string;
    role: string;
}

async function getApplications() {
    const snapshot = await adminDb.collection('users').where('role', '==', 'member').get();
    if (snapshot.empty) {
        return [];
    }
    const applications: Application[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            name: data.displayName || "N/A",
            email: data.email || "N/A",
            submitted: data.createdAt ? new Date(data.createdAt) : new Date(),
            status: data.status || "pending",
            lifetimeStatus: data.lifetimeStatus || 'not_applied'
        };
    });
    return applications;
}

async function getAdminUsers() {
    const adminsSnapshot = await adminDb.collection('users').where('role', 'in', ['admin', 'sub-admin']).get();
    if (adminsSnapshot.empty) {
        return [];
    }
    return adminsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data.email,
            role: data.role,
        };
    });
}


export default async function AdminPage() {
  const session = await verifySession();
  const applications = await getApplications();
  const lifetimeApplications = applications.filter(app => app.lifetimeStatus === 'applied');
  const serviceRequests = await getAllServiceRequests();
  const adminUsers = session?.role === 'admin' ? await getAdminUsers() : [];
  const totalMembers = applications.filter(app => app.status === 'active').length;

  async function approveUser(formData: FormData) {
    'use server';
    const uid = formData.get('uid') as string;

    const counterRef = adminDb.collection('counters').doc('memberIdCounter');
    const userRef = adminDb.collection('users').doc(uid);

    await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let newCount;
        if (!counterDoc.exists) {
            newCount = 1;
        } else {
            const currentYear = new Date().getFullYear();
            const lastResetYear = counterDoc.data()?.lastResetYear || 0;
            if (currentYear > lastResetYear) {
                newCount = 1;
                transaction.set(counterRef, { count: newCount, lastResetYear: currentYear }, { merge: true });
            } else {
                newCount = (counterDoc.data()?.count || 0) + 1;
            }
        }
        
        const year = new Date().getFullYear();
        const memberId = `NGO-${year}-${String(newCount).padStart(4, '0')}`;
        
        transaction.update(userRef, { 
            status: 'active',
            memberId: memberId,
        });

        if (counterDoc.exists) {
            transaction.update(counterRef, { count: FieldValue.increment(1) });
        } else {
            transaction.set(counterRef, { count: newCount, lastResetYear: year });
        }
    });


    await adminAuth.setCustomUserClaims(uid, { role: 'member', status: 'active' });
    revalidatePath('/admin');
    revalidatePath('/profile');
  }

  async function rejectUser(formData: FormData) {
    'use server';
    const uid = formData.get('uid') as string;
    await adminDb.collection('users').doc(uid).delete();
    await adminAuth.deleteUser(uid);
    revalidatePath('/admin');
  }


  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage membership applications and support requests.</p>
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
              <div className="text-2xl font-bold">{lifetimeApplications.length}</div>
              <p className="text-xs text-muted-foreground">Pending lifetime membership requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{serviceRequests.length}</div>
              <p className="text-xs text-muted-foreground">Total service applications</p>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Membership Applications</CardTitle>
            <CardDescription>
              Review and approve or reject new member applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {applications.map((app) => (
                          <TableRow key={app.email}>
                              <TableCell>
                                  <div className="font-medium">{app.name}</div>
                                  <div className="text-sm text-muted-foreground">{app.email}</div>
                              </TableCell>
                              <TableCell>{new Date(app.submitted).toLocaleDateString()}</TableCell>
                              <TableCell>
                                  <Badge variant={
                                      app.status === "pending" ? "secondary" : 
                                      app.status === "active" ? "default" : "destructive"
                                  }
                                  className={app.status === "active" ? "bg-accent text-accent-foreground" : ""}
                                  >
                                      {app.status}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                  {app.status === "pending" && (
                                      <div className="flex gap-2 justify-end">
                                          <form action={approveUser}>
                                              <input type="hidden" name="uid" value={app.uid} />
                                              <Button variant="outline" size="icon" type="submit">
                                                  <Check className="h-4 w-4 text-accent" />
                                                  <span className="sr-only">Approve</span>
                                              </Button>
                                          </form>
                                          <form action={rejectUser}>
                                              <input type="hidden" name="uid" value={app.uid} />
                                              <Button variant="outline" size="icon" type="submit">
                                                  <X className="h-4 w-4 text-destructive" />
                                                  <span className="sr-only">Reject</span>
                                              </Button>
                                          </form>
                                      </div>
                                  )}
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
              <CardTitle>Lifetime Membership Requests</CardTitle>
              <CardDescription>
                  Review and approve applications for lifetime membership.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {lifetimeApplications.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={3} className="text-center text-muted-foreground">
                                  No pending applications.
                              </TableCell>
                          </TableRow>
                      )}
                      {lifetimeApplications.map((app) => (
                          <TableRow key={app.uid}>
                              <TableCell>{app.name}</TableCell>
                              <TableCell>{app.email}</TableCell>
                              <TableCell className="text-right">
                                  <form action={approveLifetimeMembership}>
                                      <input type="hidden" name="uid" value={app.uid} />
                                      <Button variant="outline" size="sm" type="submit">
                                          <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                                          Approve Lifetime
                                      </Button>
                                  </form>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>

       {session?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
            <CardDescription>Create and manage sub-admin accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <form action={createSubAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                </div>
                 <Button type="submit">
                    <UserPlus className="mr-2 h-4 w-4" /> Create Sub-Admin
                 </Button>
            </form>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Admin Email</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {adminUsers.map((user) => (
                        <TableRow key={user.uid}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                 <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Service Requests</CardTitle>
            <CardDescription>
                Review and manage member requests for services and benefits.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Member ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {serviceRequests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                No pending service requests.
                            </TableCell>
                        </TableRow>
                    )}
                    {serviceRequests.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell>{req.memberId}</TableCell>
                            <TableCell>{req.serviceName}</TableCell>
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
                             <TableCell className="text-right">
                                {req.status === "pending" && (
                                    <div className="flex gap-2 justify-end">
                                        <form action={updateServiceRequestStatus}>
                                            <input type="hidden" name="requestId" value={req.id} />
                                            <input type="hidden" name="status" value="approved" />
                                            <Button variant="outline" size="icon" type="submit">
                                                <Check className="h-4 w-4 text-accent" />
                                                <span className="sr-only">Approve</span>
                                            </Button>
                                        </form>
                                        <form action={updateServiceRequestStatus}>
                                            <input type="hidden" name="requestId" value={req.id} />
                                            <input type="hidden" name="status" value="rejected" />
                                            <Button variant="outline" size="icon" type="submit">
                                                <X className="h-4 w-4 text-destructive" />
                                                <span className="sr-only">Reject</span>
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
