import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Crown } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin-app";
import { approveLifetimeMembership } from "@/app/profile/actions";

type LifetimeApplication = {
    uid: string;
    name: string;
    email: string;
}

async function getLifetimeApplications() {
    const snapshot = await adminDb.collection('users')
        .where('role', '==', 'member')
        .where('lifetimeStatus', '==', 'applied')
        .get();

    if (snapshot.empty) {
        return [];
    }
    const applications: LifetimeApplication[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            name: data.displayName || "N/A",
            email: data.email || "N/A",
        };
    });
    return applications;
}

export default async function LifetimeMembershipPage() {
    const lifetimeApplications = await getLifetimeApplications();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Lifetime Membership</h1>
                <p className="text-muted-foreground">Review and approve applications for lifetime membership.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                        The table below lists all members who have applied for a lifetime upgrade.
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
    );
}
