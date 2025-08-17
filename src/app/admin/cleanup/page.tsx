
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { deleteOldContactMessages, deleteOldPendingMembers } from "./actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type CleanupAction = () => Promise<{ success: boolean; error?: string; message?: string }>;

export default function CleanupPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleCleanup = (action: CleanupAction, successMessage: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast({ title: "Success", description: result.message || successMessage });
      } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
      }
    });
  };

  const cleanupOptions = [
    {
      title: "Delete Old Contact Messages",
      description: "This will permanently delete all contact form submissions that are older than 30 days. This action cannot be undone.",
      action: () => handleCleanup(deleteOldContactMessages, "Old contact messages have been deleted."),
    },
    {
      title: "Delete Old Pending Members",
      description: "This will permanently delete user accounts with a 'pending' status that were created more than 30 days ago. This action cannot be undone.",
      action: () => handleCleanup(deleteOldPendingMembers, "Old pending member applications have been deleted."),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Data Cleanup</h1>
        <p className="text-muted-foreground">Permanently delete old or unused data to keep the database clean and efficient.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cleanup Actions</CardTitle>
          <CardDescription>
            Use these actions with caution. Once data is deleted, it cannot be recovered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cleanupOptions.map((option) => (
            <div key={option.title} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{option.title}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isPending}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {option.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={option.action} disabled={isPending}>
                      {isPending ? "Deleting..." : "Continue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
