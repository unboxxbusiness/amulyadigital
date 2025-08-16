'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { auth, adminDb as db } from "@/lib/firebase/client-app";
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function ProfileForm() {
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchUserData = useCallback(async (user: User) => {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            setFullName(userData.displayName || user.displayName || '');
            setPortfolioUrl(userData.portfolioUrl || '');
            setBio(userData.bio || '');
        } else {
            setFullName(user.displayName || '');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchUserData(currentUser);
            } else {
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, [fetchUserData]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return;
        try {
            await updateProfile(user, { displayName: fullName });
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { displayName: fullName, portfolioUrl, bio }, { merge: true });
            toast({
                title: "Success",
                description: "Profile updated successfully.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile.",
            });
        }
    };

    if (isLoading) {
        return <p>Loading profile...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    This is how others will see you on the site.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            name="displayName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="portfolio">Portfolio URL</Label>
                        <Input id="portfolio" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} placeholder="https://your-portfolio.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Short Bio</Label>
                        <Textarea id="bio" placeholder="Tell us a little bit about yourself" value={bio} onChange={e => setBio(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit">Update Profile</Button>
                </CardFooter>
            </form>
        </Card>
    );
}
