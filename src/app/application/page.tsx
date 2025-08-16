
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ApplicationPage() {
  const [status, setStatus] = useState("pending");
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const idTokenResult = await user.getIdTokenResult(true); // Force refresh
            setStatus(idTokenResult.claims.status as string || 'pending');
            setSubmissionDate(new Date(user.metadata.creationTime!).toLocaleDateString());
        }
    });
    return () => unsubscribe();
  }, []);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Membership Application</h1>
        <p className="text-muted-foreground">Apply for membership or track your application status.</p>
      </div>
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Here is the current status of your membership application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                  <p className="font-medium">Current Status: 
                    <span className={`font-bold ${status === 'pending' ? 'text-yellow-500' : status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                        {status === 'pending' ? ' Under Review' : status === 'active' ? ' Approved' : ' Rejected'}
                    </span>
                  </p>
                  {submissionDate && <p className="text-sm text-muted-foreground">Submitted on: {submissionDate}</p>}
              </div>
              <div className="space-y-2">
                  <Label>Progress</Label>
                  <Progress value={status === 'pending' ? 50 : 100} aria-label="Application progress" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Submitted</span>
                      <span>In Review</span>
                      <span>Decision</span>
                  </div>
              </div>
               <div>
                  <h4 className="font-semibold mb-2">Next Steps</h4>
                  <p className="text-sm text-muted-foreground">
                      {status === 'pending' && "Our team is currently reviewing your application. This process typically takes 5-7 business days. You will receive an email notification once a decision has been made. Thank you for your patience!"}
                      {status === 'active' && "Congratulations! Your application has been approved. You now have full access to the member portal."}
                      {status === 'rejected' && "We regret to inform you that your application was not approved at this time. Please contact support for more information."}
                  </p>
              </div>
          </CardContent>
        </Card>
    </div>
  );
}
