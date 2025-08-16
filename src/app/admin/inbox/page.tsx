"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { columns, Message } from "./columns";
import { useEffect, useState, useTransition } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { adminDb } from "@/lib/firebase/client-app";
import { Button } from "@/components/ui/button";
import { deleteMessages } from "./actions";
import { useToast } from "@/hooks/use-toast";

export default function InboxPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        const messagesCollection = collection(adminDb, 'contactSubmissions');
        const q = query(messagesCollection, orderBy('submittedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages: Message[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || "N/A",
                    email: data.email || "N/A",
                    category: data.category || 'N/A',
                    message: data.message || '',
                    submittedAt: data.submittedAt,
                    status: data.status,
                };
            });
            setMessages(fetchedMessages);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    const handleBulkDelete = () => {
        startTransition(async () => {
            const result = await deleteMessages(selectedMessageIds);
            if (result.success) {
                toast({ title: "Success", description: "Selected messages have been deleted." });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        });
    }

    const onRowSelectionChange = (selectedRows: Record<string, boolean>) => {
        const selectedIds = messages
            .filter((_, index) => selectedRows[index])
            .map(message => message.id);
        setSelectedMessageIds(selectedIds);
    };


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Inbox</h1>
                <p className="text-muted-foreground">Review messages and inquiries from members.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Contact Messages</CardTitle>
                    <CardDescription>
                        The table below lists all messages submitted through the contact form.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading messages...</p>
                    ) : (
                        <DataTable 
                            columns={columns} 
                            data={messages} 
                            filterColumnId="name"
                            filterPlaceholder="Filter by name..."
                            onRowSelectionChange={onRowSelectionChange}
                            bulkActions={
                                selectedMessageIds.length > 0 ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleBulkDelete}
                                        disabled={isPending}
                                    >
                                        Delete ({selectedMessageIds.length})
                                    </Button>
                                ) : null
                            }
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
