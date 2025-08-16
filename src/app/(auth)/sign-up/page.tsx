'use client';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {signUp} from '../actions';
import {useToast} from '@/hooks/use-toast';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {toast} = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: result.error,
      });
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
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">
              Create account
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
