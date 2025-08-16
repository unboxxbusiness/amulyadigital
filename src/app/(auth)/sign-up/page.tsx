
'use client';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {useState} from 'react';
import {signUp} from '../actions';
import {useToast} from '@/hooks/use-toast';

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  const handleFirebaseAuthErrors = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await signUp(formData);

      if (result?.error) {
        // This handles custom errors from our server action (e.g., admin exists)
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: result.error,
        });
      } else {
        toast({
          title: 'Sign Up Successful',
          description: "You're being redirected to your application page.",
        });
        // The redirect is handled by the server action, so we don't need to do it here
      }
    } catch (error: any) {
      if (error.digest?.startsWith('NEXT_REDIRECT')) {
        // This is not a real error, just Next.js redirecting. Let it proceed.
        return;
      }
      // This handles Firebase Auth errors (e.g., weak password)
      const friendlyMessage = handleFirebaseAuthErrors(error.code);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>Enter your information to create an account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create account'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/sign-in" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
