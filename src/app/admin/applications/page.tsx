"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { columns, Application } from "./columns";
import { DataTable } from "@/components/data-table";
import { useEffect, useState } from "react";
import { adminDb } from "@/lib/firebase/client-app";
import { collection, query, where, onSnapshot } from "firebase/firestore";

async function getApplications() {
    const usersCollection = collection(adminDb, 'users');
    const q = query(usersCollection, where('role', '==', 'member'));
    
    return new Promise<Application[]>((resolve, reject) => {
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                resolve([]);
                return;
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
            resolve(applications);
        }, reject);
    });
}

export default function MembershipApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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
              />
            )}
          </CardContent>
        </Card>
    </div>
  );
}
