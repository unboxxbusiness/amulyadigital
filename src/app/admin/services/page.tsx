"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ServiceRequest, columns } from "./columns";
import { useEffect, useState } from "react";
import { adminDb } from "@/lib/firebase/client-app";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

export default function ServiceRequestsPage() {
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const requestsCollection = collection(adminDb, 'serviceRequests');
        const q = query(requestsCollection, orderBy('createdAt', 'desc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const requests: ServiceRequest[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
            setServiceRequests(requests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching service requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Service Requests</h1>
                <p className="text-muted-foreground">Review and manage member requests for services and benefits.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Requests</CardTitle>
                    <CardDescription>
                        The table below lists all member service requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading service requests...</p>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={serviceRequests}
                            filterColumnId="memberId"
                            filterPlaceholder="Filter by Member ID..."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
