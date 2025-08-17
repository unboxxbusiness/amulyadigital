'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase/client-app";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tags } from "lucide-react";

type Offer = {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export default function OffersPage() {
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Exclusive Offers</h1>
                <p className="text-muted-foreground">Here are the latest offers available exclusively for our members.</p>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="p-3 bg-secondary rounded-lg">
                        <Tags className="size-8 text-accent" />
                    </div>
                    <div>
                        <CardTitle>Available Offers</CardTitle>
                        <CardDescription>
                            Browse through the offers below for more details.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading offers...</p>
                    ) : offers.length === 0 ? (
                        <p className="text-muted-foreground">There are currently no offers available. Please check back later.</p>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {offers.map(offer => (
                                <AccordionItem key={offer.id} value={offer.id}>
                                    <AccordionTrigger>{offer.title}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="whitespace-pre-wrap">{offer.description}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
