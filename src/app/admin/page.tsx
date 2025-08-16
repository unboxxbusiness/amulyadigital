import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";

const applications = [
    { name: "Elena Rodriguez", email: "elena.r@example.com", submitted: "2024-07-28", status: "Pending" },
    { name: "Ben Carter", email: "ben.carter@example.com", submitted: "2024-07-27", status: "Pending" },
    { name: "Aisha Khan", email: "aisha.k@example.com", submitted: "2024-07-25", status: "Approved" },
    { name: "Marcus Chen", email: "marcus.chen@example.com", submitted: "2024-07-24", status: "Rejected" },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage membership applications and support requests.</p>
      </div>

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
                            <TableCell>{app.submitted}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    app.status === "Pending" ? "secondary" : 
                                    app.status === "Approved" ? "default" : "destructive"
                                }
                                className={app.status === "Approved" ? "bg-accent text-accent-foreground" : ""}
                                >
                                    {app.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {app.status === "Pending" && (
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" size="icon">
                                            <Check className="h-4 w-4 text-accent" />
                                            <span className="sr-only">Approve</span>
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <X className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Reject</span>
                                        </Button>
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
