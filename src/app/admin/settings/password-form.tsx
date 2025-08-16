
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase/client-app";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";

export function PasswordForm() {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const handlePasswordReset = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not find an authenticated user or email.",
            });
            return;
        }

        setIsSending(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            toast({
                title: "Password Reset Email Sent",
                description: `An email has been sent to ${user.email} with instructions to reset your password.`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error Sending Email",
                description: "An unexpected error occurred. Please try again later.",
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    Change your password by sending a reset link to your email.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handlePasswordReset} disabled={isSending}>
                    {isSending ? "Sending..." : "Send Password Reset Email"}
                </Button>
            </CardContent>
        </Card>
    );
}
