
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllUsers, getAllServiceRequests, getAllInboxMessages } from "./actions";
import { userColumns, serviceRequestColumns, messageColumns } from "./columns";

export default async function ReportsPage() {
    const [users, serviceRequests, messages] = await Promise.all([
        getAllUsers(),
        getAllServiceRequests(),
        getAllInboxMessages(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Reports</h1>
                <p className="text-muted-foreground">A consolidated view of all data across the application.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Data</CardTitle>
                    <CardDescription>
                        Use the tabs below to navigate between different data collections.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="members" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="members">All Members ({users.length})</TabsTrigger>
                            <TabsTrigger value="requests">Service Requests ({serviceRequests.length})</TabsTrigger>
                            <TabsTrigger value="inbox">Inbox ({messages.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="members">
                            <DataTable 
                                columns={userColumns} 
                                data={users}
                                filterColumnId="name"
                                filterPlaceholder="Filter by name or email..."
                                dateFilterColumnId="createdAt"
                            />
                        </TabsContent>

                        <TabsContent value="requests">
                            <DataTable 
                                columns={serviceRequestColumns} 
                                data={JSON.parse(JSON.stringify(serviceRequests))}
                                filterColumnId="name"
                                filterPlaceholder="Filter by name..."
                                dateFilterColumnId="createdAt"
                            />
                        </TabsContent>

                        <TabsContent value="inbox">
                            <DataTable 
                                columns={messageColumns} 
                                data={messages}
                                filterColumnId="name"
                                filterPlaceholder="Filter by name..."
                                dateFilterColumnId="submittedAt"
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
