"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Application } from "./columns";
import { DataTable } from "@/components/data-table";
import { useEffect, useState, useTransition, useCallback } from "react";
import { adminDb } from "@/lib/firebase/client-app";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { approveUsers, rejectUsers } from "./actions";

export default function MembershipApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicationUids, setSelectedApplicationUids] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    const usersCollection = collection(adminDb, 'users');
    const q = query(usersCollection, where('role', '==', 'member'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedApplications: Application[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          name: data.displayName || "N/A",
          email: data.email || "N/A",
          submitted: data.createdAt ? new Date(data.createdAt) : new Date(),
          status: data.status || "pending",
        };
      });
      setApplications(fetchedApplications);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBulkAction = (action: 'approve' | 'reject') => {
    startTransition(async () => {
      const actionFn = action === 'approve' ? approveUsers : rejectUsers;
      const result = await actionFn(selectedApplicationUids);
      if (result.success) {
        toast({ title: "Success", description: `Selected applications have been ${action}d.` });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  }

  const onRowSelectionChange = useCallback((selectedRows: Record<string, boolean>) => {
      const selectedUids = applications
          .filter((_, index) => selectedRows[index])
          .map(app => app.uid);
      setSelectedApplicationUids(selectedUids);
  }, [applications]);

  const bulkActions = selectedApplicationUids.length > 0 ? (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleBulkAction('approve')}
        disabled={isPending}
      >
        Approve ({selectedApplicationUids.length})
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleBulkAction('reject')}
        disabled={isPending}
      >
        Reject ({selectedApplicationUids.length})
      </Button>
    </div>
  ) : null;

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
            {loading ? (
              <p>Loading applications...</p>
            ) : (
              <DataTable 
                columns={columns} 
                data={applications}
                filterColumnId="name"
                filterPlaceholder="Filter by applicant name..."
                onRowSelectionChange={onRowSelectionChange}
                bulkActions={bulkActions}
              />
            )}
          </CardContent>
        </Card>
    </div>
  );
}
