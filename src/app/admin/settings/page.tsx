'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "./profile-form";
import { ThemeForm } from "./theme-form";
import { MembershipIdForm } from "./membership-id-form";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client-app";

export default function AdminSettingsPage() {
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const idTokenResult = await user.getIdTokenResult(true);
                setUserRole(idTokenResult.claims.role as string);
            } else {
                setUserRole(null);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account, theme, and application settings.</p>
            </div>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="theme">Theme</TabsTrigger>
                    {userRole === 'admin' && <TabsTrigger value="membership-id">Membership ID</TabsTrigger>}
                </TabsList>
                <TabsContent value="profile">
                    <ProfileForm />
                </TabsContent>
                <TabsContent value="theme">
                    <ThemeForm />
                </TabsContent>
                {userRole === 'admin' && (
                    <TabsContent value="membership-id">
                        <MembershipIdForm />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
