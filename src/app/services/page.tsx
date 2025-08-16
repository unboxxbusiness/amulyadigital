'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Briefcase, Landmark } from "lucide-react";
import { applyForService, getMemberServiceRequests } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useTransition } from "react";

type ServiceRequest = {
    id: string;
    serviceName: string;
    status: string;
    createdAt: string;
}

export default function ServicesPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMemberServiceRequests().then(data => {
            setRequests(data as ServiceRequest[]);
            setLoading(false);
        });
    }, []);

    const handleApply = (serviceName: string) => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('serviceName', serviceName);
            const result = await applyForService(formData);
            if (result.success) {
                toast({ title: "Success", description: result.message });
                setLoading(true);
                getMemberServiceRequests().then(data => {
                    setRequests(data as ServiceRequest[]);
                    setLoading(false);
                });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        });
    }

    const services = [
        {
            title: "Educational Services",
            description: "Apply for our exclusive discounted courses to enhance your skills.",
            icon: <BookOpen className="size-8 text-accent" />,
            action: "Apply for Courses",
            serviceName: "Discounted Courses"
        },
        {
            title: "Business Support",
            description: "Request access to licensed software and tools to support your business.",
            icon: <Briefcase className="size-8 text-accent" />,
            action: "Request Tools",
            serviceName: "Licensed Tools"
        },
        {
            title: "Banking & Financial",
            description: "Get access to special bank accounts and loan options tailored for our members.",
            icon: <Landmark className="size-8 text-accent" />,
            action: "Apply for Account",
            serviceName: "Financial Services"
        }
    ];

    const getRequestStatusForService = (serviceName: string) => {
        const request = requests.find(r => r.serviceName === serviceName);
        return request ? request.status : null;
    }

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Services & Benefits</h1>
        <p className="text-muted-foreground">Access exclusive services available to Amulya Digital members.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
            const status = getRequestStatusForService(service.serviceName);
            const hasApplied = status !== null;

            return (
             <Card key={service.title} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    {service.icon}
                    <div className="flex-1">
                       <CardTitle>{service.title}</CardTitle>
                    </div>
                     {hasApplied && (
                       <Badge 
                          variant={
                              status === "pending" ? "secondary" : 
                              status === "approved" ? "default" : "destructive"
                          }
                          className={status === "approved" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {status}
                        </Badge>
                     )}
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter>
                    <Button 
                        onClick={() => handleApply(service.serviceName)} 
                        disabled={isPending || hasApplied}
                        className="w-full"
                    >
                        {isPending ? "Applying..." : hasApplied ? "Applied" : service.action}
                    </Button>
                </CardFooter>
            </Card>
        )})}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>My Service Requests</CardTitle>
            <CardDescription>Track the status of your applications for services and benefits.</CardDescription>
        </CardHeader>
        <CardContent>
             {loading ? (
                <p>Loading requests...</p>
             ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">You have not made any service requests.</TableCell>
                            </TableRow>
                        ) : (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.serviceName}</TableCell>
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
                                </TableRow>
                            ))
                        )}
                    
                    </TableBody>
                </Table>
             )}
        </CardContent>
      </Card>

    </div>
  )
}
