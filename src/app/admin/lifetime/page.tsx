
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client-app";

export type LifetimeApplication = {
    uid: string;
    name: string;
    email: string;
    memberId?: string;
    lifetimeStatus: 'not_applied' | 'applied' | 'approved';
    lifetimeStartDate?: string;
    lifetimeExpiry?: string;
    paymentTransactionId?: string;
}

export default function LifetimeMembershipPage() {
    const [applications, setApplications] = useState<LifetimeApplication[]>([]);
    const [loading, setLoading] = useState(true);

     useEffect(() => {
        const usersCollection = collection(db, 'users');
        const q = query(
            usersCollection,
            where('role', '==', 'member'),
            where('lifetimeStatus', 'in', ['applied', 'approved'])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedApplications: LifetimeApplication[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    name: data.displayName || "N/A",
                    email: data.email || "N/A",
                    memberId: data.memberId,
                    lifetimeStatus: data.lifetimeStatus || 'not_applied',
                    lifetimeStartDate: data.lifetimeStartDate,
                    lifetimeExpiry: data.lifetimeExpiry,
                    paymentTransactionId: data.paymentTransactionId,
                };
            });
            setApplications(fetchedApplications);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching lifetime applications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Lifetime Membership</h1>
                <p className="text-muted-foreground">Review and approve applications for lifetime membership.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Membership Requests</CardTitle>
                    <CardDescription>
                        The table below lists all members who have applied for or have an active lifetime upgrade.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading applications...</p>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={applications} 
                            filterColumnId="name"
                            filterPlaceholder="Filter by name..."
                            dateFilterColumnId="lifetimeStartDate"
                            exportable={true}
                            exportFileName="lifetime_requests.csv"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
