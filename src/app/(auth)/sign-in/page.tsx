
'use client';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {useState} from 'react';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '@/lib/firebase/client-app';
import {createSessionAction} from '../actions';
import {useToast} from '@/hooks/use-toast';
import {useRouter} from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();
  const router = useRouter();

  const handleFirebaseAuthErrors = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const {user} = userCredential;

      const result = await createSessionAction(user.uid);

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: 'Sign In Successful',
        description: "Welcome back! You're being redirected...",
      });
      // Manually redirect on the client-side
      router.push(result.redirectPath!);
    } catch (error: any) {
      const friendlyMessage = handleFirebaseAuthErrors(error.code);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: friendlyMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your email below to sign in to your account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
