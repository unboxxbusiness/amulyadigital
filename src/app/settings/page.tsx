'use client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { MembershipStatus } from "./membership-status";

export default function MemberSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account, password, and membership.</p>
            </div>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="membership">Membership</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <ProfileForm />
                </TabsContent>
                <TabsContent value="password">
                    <PasswordForm />
                </TabsContent>
                <TabsContent value="membership">
                    <MembershipStatus />
                </TabsContent>
            </Tabs>
        </div>
    );
}
