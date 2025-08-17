
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      
      <Card>
        <CardHeader>
            <CardTitle>All Services</CardTitle>
            <CardDescription>Select a service to view details and apply.</CardDescription>
        </CardHeader>
        <CardContent>
             <Tabs defaultValue={services[0].serviceName} className="w-full">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                    {services.map((service) => (
                        <TabsTrigger key={service.serviceName} value={service.serviceName}>
                            {service.title}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {services.map((service) => {
                    const status = getRequestStatusForService(service.serviceName);
                    const hasApplied = status !== null;

                    return (
                        <TabsContent key={service.serviceName} value={service.serviceName}>
                            <div className="flex flex-col md:flex-row items-start gap-6 p-6 border rounded-lg mt-2">
                                <div className="p-3 bg-secondary rounded-lg">
                                    {service.icon}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">{service.title}</h3>
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
                                    </div>
                                    <p className="text-sm text-muted-foreground">{service.description}</p>
                                </div>
                                <Button 
                                    onClick={() => handleApply(service.serviceName)} 
                                    disabled={isPending || hasApplied}
                                    className="w-full md:w-auto"
                                >
                                    {isPending ? "Applying..." : hasApplied ? "Applied" : service.action}
                                </Button>
                            </div>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </CardContent>
      </Card>

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
