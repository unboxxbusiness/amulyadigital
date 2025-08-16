
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { ServiceRequest, columns } from "./columns";
import { useEffect, useState, useTransition, useCallback } from "react";
import { adminDb } from "@/lib/firebase/client-app";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateServiceRequestsStatus, deleteServiceRequests } from "@/app/services/actions";

export default function ServiceRequestsPage() {
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

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

    const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
        startTransition(async () => {
            let result;
            if (action === 'delete') {
                result = await deleteServiceRequests(selectedRequestIds);
            } else {
                result = await updateServiceRequestsStatus(selectedRequestIds, action === 'approve' ? 'approved' : 'rejected');
            }

            if (result.success) {
                toast({ title: "Success", description: `Selected requests have been ${action}d.` });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        });
    }

    const onRowSelectionChange = useCallback((selectedRows: Record<string, boolean>) => {
      const selectedIds = serviceRequests
          .filter((_, index) => selectedRows[index])
          .map(req => req.id);
      setSelectedRequestIds(selectedIds);
    }, [serviceRequests]);

     const bulkActions = selectedRequestIds.length > 0 ? (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('approve')}
                disabled={isPending}
            >
                Approve ({selectedRequestIds.length})
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('reject')}
                disabled={isPending}
            >
                Reject ({selectedRequestIds.length})
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={isPending}
            >
                Delete ({selectedRequestIds.length})
            </Button>
        </div>
    ) : null;

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
                            dateFilterColumnId="createdAt"
                            onRowSelectionChange={onRowSelectionChange}
                            bulkActions={bulkActions}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
