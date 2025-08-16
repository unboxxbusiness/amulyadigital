'use client';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {auth} from '@/lib/firebase/client-app';
import {updateProfile} from 'firebase/auth';
import {useState, useEffect} from 'react';
import {useToast} from '@/hooks/use-toast';

export default function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [bio, setBio] = useState('');
  const {toast} = useToast();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, []);

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateProfile(user, {displayName: fullName});
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Profile</h1>
        <p className="text-muted-foreground">View and edit your profile information.</p>
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
            <Input id="portfolio" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
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
    </div>
  );
}
