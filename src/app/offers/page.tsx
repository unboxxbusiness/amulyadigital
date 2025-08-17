import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tags } from "lucide-react";
import { adminDb } from "@/lib/firebase/admin-app";

export const revalidate = 600; // Revalidate every 10 minutes

type Offer = {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

async function getOffers(): Promise<Offer[]> {
    const offersSnapshot = await adminDb.collection('offers').orderBy('createdAt', 'desc').get();
    if (offersSnapshot.empty) {
        return [];
    }
    return offersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as Offer));
}


export default async function OffersPage() {
    const offers = await getOffers();

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
                    {offers.length === 0 ? (
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
