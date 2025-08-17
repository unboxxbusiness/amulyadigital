
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { addOffer } from "./actions";
import { useEffect, useState, useTransition } from "react";
import { DataTable } from "@/components/data-table";
import { columns, Offer } from "./columns";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client-app";

export default function AdminOffersPage() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const offersCollection = collection(db, 'offers');
        const q = query(offersCollection, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOffers: Offer[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as Offer));
            setOffers(fetchedOffers);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching offers:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            const result = await addOffer(formData);
            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error,
                });
            } else {
                toast({
                    title: "Success",
                    description: "New offer has been added.",
                });
                form.reset();
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Manage Offers</h1>
                <p className="text-muted-foreground">Create and manage offers for your members.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Offer</CardTitle>
                    <CardDescription>
                        This offer will be visible to members and accessible by the AI chat assistant.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Offer Title</Label>
                            <Input id="title" name="title" placeholder="e.g., 50% Off Annual Membership" required disabled={isPending} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Offer Description</Label>
                            <Textarea id="description" name="description" placeholder="Provide a detailed description of the offer for the members." required disabled={isPending} />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Adding Offer...' : 'Add Offer'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Current Offers</CardTitle>
                    <CardDescription>
                        List of all active offers.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading offers...</p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={offers}
                            filterColumnId="title"
                            filterPlaceholder="Filter by title..."
                            exportable={true}
                            exportFileName="offers.csv"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
