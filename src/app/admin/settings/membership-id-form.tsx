'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getMembershipIdCounter, updateMembershipIdCounter } from "./actions";

export function MembershipIdForm() {
    const { toast } = useToast();
    const [prefix, setPrefix] = useState('NGO');
    const [nextNumber, setNextNumber] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMembershipIdCounter().then(data => {
            if (!data.error) {
                setPrefix(data.prefix);
                setNextNumber(data.nextNumber);
            }
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = await updateMembershipIdCounter(formData);

        if (result.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Membership ID settings updated.",
            });
        }
    };

    if (loading) {
        return <p>Loading settings...</p>;
    }
    
    const currentYear = new Date().getFullYear();
    const exampleId = `${prefix}-${currentYear}-${String(nextNumber).padStart(4, '0')}`;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Membership ID Management</CardTitle>
                <CardDescription>
                    Configure the format and starting number for new member IDs. The year is automatically included.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="prefix">ID Prefix</Label>
                            <Input
                                id="prefix"
                                name="prefix"
                                defaultValue={prefix}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nextNumber">Next Member Number</Label>
                            <Input
                                id="nextNumber"
                                name="nextNumber"
                                type="number"
                                defaultValue={nextNumber}
                                required
                            />
                        </div>
                    </div>
                     <div className="text-sm text-muted-foreground">
                        Example next ID: <span className="font-mono">{exampleId}</span>
                    </div>
                    <Button type="submit">Save Settings</Button>
                </form>
            </CardContent>
        </Card>
    );
}
