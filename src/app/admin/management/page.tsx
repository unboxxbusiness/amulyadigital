
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { createSubAdmin } from "./actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/data-table";
import { AdminUser, columns } from "./columns";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client-app";
import { collection, onSnapshot, query, where } from "firebase/firestore";

export default function AdminManagementPage() {
    const { toast } = useToast();
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('role', 'in', ['admin', 'sub-admin']));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users: AdminUser[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    email: data.email,
                    role: data.role,
                };
            });
            setAdminUsers(users);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching admin users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await createSubAdmin(formData);
        
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Sub-admin created successfully.",
            });
            (event.target as HTMLFormElement).reset();
        }
    };


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
                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                   {loading ? (
                        <p>Loading admins...</p>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={adminUsers}
                            filterColumnId="email"
                            filterPlaceholder="Filter by email..."
                        />
                    )}
                </CardContent>
            </Card>
         </div>
    )
}
