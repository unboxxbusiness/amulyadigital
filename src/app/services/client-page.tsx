
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { applyForService } from "./actions";
import type { getMemberServiceRequests } from "./actions";

type ServiceRequest = Awaited<ReturnType<typeof getMemberServiceRequests>>[0];

export function ServicesClientPage({ initialRequests }: { initialRequests: ServiceRequest[] }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const result = await applyForService(formData);
            if (result.success) {
                toast({
                    title: "Success!",
                    description: result.message,
                });
                form.reset();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Services</h1>
                <p className="text-muted-foreground">Apply for new services and view your application history.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Apply for a New Service</CardTitle>
                    <CardDescription>
                        Select a service from the list below and submit your application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex items-end gap-4">
                        <div className="flex-1">
                            <Select name="serviceName" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Education Support">Education Support</SelectItem>
                                    <SelectItem value="Money Support">Money Support</SelectItem>
                                    <SelectItem value="Software for Startup">Software for Startup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Submitting...' : 'Apply Now'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Service Requests</CardTitle>
                    <CardDescription>
                        A history of all your service applications and their current status.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        You have not applied for any services yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                initialRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.serviceName}</TableCell>
                                        <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    req.status === "pending" ? "secondary" :
                                                        req.status === "approved" ? "default" : "destructive"
                                                }
                                                className={req.status === "approved" ? "bg-accent text-accent-foreground" : ""}
                                            >
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
