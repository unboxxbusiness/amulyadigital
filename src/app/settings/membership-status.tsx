
'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client-app';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';
import { applyForLifetimeMembership } from '@/app/profile/actions';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import type { User } from 'firebase/auth';

export function MembershipStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [memberId, setMemberId] = useState('');
  const [lifetimeStatus, setLifetimeStatus] = useState('');
  const [lifetimeExpiry, setLifetimeExpiry] = useState('');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const fetchUserData = useCallback(async (user: User) => {
    setIsLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setFullName(userData.displayName || '');
      setEmail(userData.email || '');
      setStatus(userData.status || '');
      setMemberId(userData.memberId || '');
      setLifetimeStatus(userData.lifetimeStatus || 'not_applied');
      setLifetimeExpiry(userData.lifetimeExpiry || '');
      setPaymentTransactionId(userData.paymentTransactionId || '');
    } else {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const handleApply = async () => {
    if (!user) return;
    setIsApplying(true);
    try {
      const result = await applyForLifetimeMembership();
      if (result.success) {
        setLifetimeStatus('applied');
        toast({
          title: 'Application Submitted',
          description: 'Your lifetime membership application is under review.',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Application Failed',
        description: error.message,
      });
    } finally {
      setIsApplying(false);
    }
  };

  const generateMembershipCard = async () => {
    if (!user) return;
    const docPDF = new jsPDF();
    
    docPDF.setFillColor(240, 240, 240);
    docPDF.rect(0, 0, 210, 40, 'F');
    docPDF.setFontSize(22);
    docPDF.setTextColor(33, 33, 33);
    docPDF.setFont('helvetica', 'bold');
    docPDF.text('Amulya Digital', 105, 25, { align: 'center' });
    
    docPDF.setFontSize(18);
    docPDF.setTextColor(105, 20, 40);
    docPDF.text('Membership Card', 105, 55, { align: 'center' });
    
    docPDF.setFontSize(12);
    docPDF.setTextColor(33, 33, 33);
    docPDF.setFont('helvetica', 'normal');
    docPDF.text(`Name: ${fullName}`, 20, 80);
    docPDF.text(`Email: ${email}`, 20, 90);
    docPDF.text(`Membership ID: ${memberId}`, 20, 100);
    if (lifetimeStatus === 'approved') {
        docPDF.setFont('helvetica', 'bold');
        docPDF.text(`Status: Lifetime Member`, 20, 110);
        docPDF.setFont('helvetica', 'normal');
        docPDF.text(`Expires: ${format(new Date(lifetimeExpiry), "PPP")}`, 20, 120);
    }

    try {
        const qrCodeDataUrl = await QRCode.toDataURL(window.location.origin, { errorCorrectionLevel: 'H' });
        docPDF.addImage(qrCodeDataUrl, 'PNG', 140, 75, 50, 50);
    } catch (err) {
        console.error(err);
    }

    docPDF.setLineWidth(0.5);
    docPDF.setDrawColor(224, 224, 224);
    docPDF.line(20, 270, 190, 270);
    docPDF.setFontSize(10);
    docPDF.setTextColor(150, 150, 150);
    docPDF.text('© 2024 Amulya Digital NGO. All rights reserved.', 105, 280, { align: 'center' });

    docPDF.save('Amulya_Digital_Membership_Card.pdf');
  };

  if (isLoading) {
    return <p>Loading membership status...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership Status</CardTitle>
        <CardDescription>Manage your membership status and benefits.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === 'active' && (
          <div className="space-y-4 p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Membership Card</p>
                  <p className="text-sm text-muted-foreground">
                      Your official membership card is available for download.
                  </p>
                </div>
                <Badge className="text-lg bg-accent text-accent-foreground">Batch Member</Badge>
              </div>
              <Button onClick={generateMembershipCard}>Download Membership Card</Button>
          </div>
        )}

        {lifetimeStatus === 'not_applied' && status === 'active' && (
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg font-semibold">5-Year Lifetime Membership</h3>
            <p className="text-sm text-muted-foreground">
              Become a lifetime member for 5 years to enjoy exclusive benefits. The cost is ₹1,000, payable offline. After applying, an admin will contact you to arrange payment.
            </p>
            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? 'Submitting...' : 'Apply for 5-Year Membership'}
            </Button>
          </div>
        )}

        {lifetimeStatus === 'applied' && (
          <div className="p-4 bg-secondary rounded-lg">
            <p className="font-semibold">Your lifetime application is under review.</p>
            <p className="text-sm text-muted-foreground">
              Thank you for applying! Our team will review your application and contact you regarding the offline payment of ₹1,000.
            </p>
          </div>
        )}

        {lifetimeStatus === 'approved' && (
           <div className="space-y-4">
             <div className="p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="font-semibold text-green-800 dark:text-green-200">Congratulations! You are a Lifetime Member.</p>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1 mt-2">
                <p><strong>Expires on:</strong> {format(new Date(lifetimeExpiry), "PPP")}</p>
                <p><strong>Transaction ID:</strong> {paymentTransactionId}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
