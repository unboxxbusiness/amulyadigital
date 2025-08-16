import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { adminAuth, adminDb } from "@/lib/firebase/admin-app";
import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";

type Application = {
    uid: string;
    name: string;
    email: string;
    submitted: Date;
    status: string;
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
        };
    });
    return applications;
}

export default async function MembershipApplicationsPage() {
  const applications = await getApplications();

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
    revalidatePath('/admin/applications');
  }

  async function rejectUser(formData: FormData) {
    'use server';
    const uid = formData.get('uid') as string;
    await adminDb.collection('users').doc(uid).delete();
    await adminAuth.deleteUser(uid);
    revalidatePath('/admin/applications');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Membership Applications</h1>
        <p className="text-muted-foreground">Review and approve or reject new member applications.</p>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>
              The table below lists all users awaiting membership approval.
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
                       {applications.length === 0 && (
                          <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                  No pending applications.
                              </TableCell>
                          </TableRow>
                      )}
                      {applications.map((app) => (
                          <TableRow key={app.uid}>
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
    </div>
  );
}
