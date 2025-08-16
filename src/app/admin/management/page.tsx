import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin-app";
import { createSubAdmin } from "./actions";
import { verifySession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

type AdminUser = {
    uid: string;
    email: string;
    role: string;
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

export default async function AdminManagementPage() {
    const session = await verifySession();
    if (session?.role !== 'admin') {
        redirect('/admin');
    }
    const adminUsers = await getAdminUsers();

    return (
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Management</h1>
                <p className="text-muted-foreground">Create and manage sub-admin accounts.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Sub-Admin</CardTitle>
                    <CardDescription>
                        Sub-admins can manage members and service requests, but cannot create other admins.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Existing Admins</CardTitle>
                    <CardDescription>
                        List of all administrator and sub-administrator accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
         </div>
    )
}
