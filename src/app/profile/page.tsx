'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase/client-app';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useState, useEffect, useCallback } from 'react';
import { applyForLifetimeMembership } from './actions';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Leaf } from 'lucide-react';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('');
  const [lifetimeStatus, setLifetimeStatus] = useState('');
  const [lifetimeMembershipId, setLifetimeMembershipId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const fetchUserData = useCallback(async (user: any) => {
    setIsLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setFullName(userData.displayName || '');
      setEmail(userData.email || '');
      setPortfolioUrl(userData.portfolioUrl || '');
      setBio(userData.bio || '');
      setStatus(userData.status || '');
      setLifetimeStatus(userData.lifetimeStatus || 'not_applied');
      setLifetimeMembershipId(userData.lifetimeMembershipId || '');
    } else {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData(user);
      } else {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserData]);

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateProfile(user, { displayName: fullName });
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { displayName: fullName, portfolioUrl, bio }, { merge: true });

        toast({
          title: 'Profile Updated',
          description: 'Your changes have been saved successfully.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message,
        });
      }
    }
  };

  const handleApply = async () => {
    const user = auth.currentUser;
    if (user) {
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
    }
  };

  const generateMembershipCard = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.setFont('helvetica', 'bold');
    doc.text('Amulya Digital', 105, 25, { align: 'center' });
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(105, 20, 40); // Accent color
    doc.text('Lifetime Membership Card', 105, 55, { align: 'center' });
    
    // Member Info
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${fullName}`, 20, 80);
    doc.text(`Email: ${email}`, 20, 90);
    doc.text(`Membership ID: ${lifetimeMembershipId}`, 20, 100);

    // QR Code
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(window.location.origin, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.9,
            margin: 1,
            color: {
                dark: '#212121',
                light: '#ffffff'
            }
        });
        doc.addImage(qrCodeDataUrl, 'PNG', 140, 75, 50, 50);
    } catch (err) {
        console.error(err)
    }

    // Footer
    doc.setLineWidth(0.5);
    doc.setDrawColor(224, 224, 224);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2024 Amulya Digital NGO. All rights reserved.', 105, 280, { align: 'center' });


    doc.save('Amulya_Digital_Membership_Card.pdf');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Profile</h1>
          <p className="text-muted-foreground">View and edit your profile information.</p>
        </div>
        {status === 'active' && <Badge className="text-lg bg-accent text-accent-foreground">Batch Member</Badge>}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal and professional information here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
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
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lifetime Membership</CardTitle>
          <CardDescription>Manage your lifetime membership status.</CardDescription>
        </CardHeader>
        <CardContent>
          {lifetimeStatus === 'not_applied' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Become a lifetime member to enjoy exclusive benefits and show your long-term support for our community. The application process is quick and subject to manual review and payment processing.
              </p>
              <Button onClick={handleApply} disabled={isApplying}>
                {isApplying ? 'Submitting...' : 'Apply Now'}
              </Button>
            </div>
          )}
          {lifetimeStatus === 'applied' && (
            <div className="p-4 bg-secondary rounded-lg">
              <p className="font-semibold">Your application is under review.</p>
              <p className="text-sm text-muted-foreground">
                Thank you for applying! Our team will review your application and contact you regarding payment.
              </p>
            </div>
          )}
          {lifetimeStatus === 'approved' && (
             <div className="space-y-4">
               <div className="p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-semibold text-green-800 dark:text-green-200">Congratulations! You are a Lifetime Member.</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Welcome to an exclusive group of supporters. Download your official membership card below.
                </p>
              </div>
              <Button onClick={generateMembershipCard}>Download Membership Card</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
