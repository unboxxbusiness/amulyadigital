import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X } from "lucide-react";
import { getAllServiceRequests, updateServiceRequestStatus } from "@/app/services/actions";

export default async function ServiceRequestsPage() {
    const serviceRequests = await getAllServiceRequests();

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Service Requests</h1>
                <p className="text-muted-foreground">Review and manage member requests for services and benefits.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                        The table below lists all member service requests awaiting approval.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member ID</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {serviceRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No pending service requests.
                                    </TableCell>
                                </TableRow>
                            )}
                            {serviceRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.memberId}</TableCell>
                                    <TableCell>{req.serviceName}</TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            req.status === "pending" ? "secondary" : 
                                            req.status === "approved" ? "default" : "destructive"
                                        }
                                        className={req.status === "approved" ? "bg-accent text-accent-foreground" : ""}
                                        >
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "pending" && (
                                            <div className="flex gap-2 justify-end">
                                                <form action={updateServiceRequestStatus}>
                                                    <input type="hidden" name="requestId" value={req.id} />
                                                    <input type="hidden" name="status" value="approved" />
                                                    <Button variant="outline" size="icon" type="submit">
                                                        <Check className="h-4 w-4 text-accent" />
                                                        <span className="sr-only">Approve</span>
                                                    </Button>
                                                </form>
                                                <form action={updateServiceRequestStatus}>
                                                    <input type="hidden" name="requestId" value={req.id} />
                                                    <input type="hidden" name="status" value="rejected" />
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
    )
}
