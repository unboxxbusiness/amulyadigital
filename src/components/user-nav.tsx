
'use client';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {useEffect, useState} from 'react';
import { onAuthStateChanged, User} from 'firebase/auth';
import {signOut} from '@/app/(auth)/actions';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client-app';

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
            const idTokenResult = await currentUser.getIdTokenResult(true);
            setUserRole(idTokenResult.claims.role as string);
        } catch (error: any) {
            if (error.code === 'auth/user-token-expired') {
                await signOut();
            }
            setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <Link href="/sign-in">
        <Button variant="outline">Sign In</Button>
      </Link>
    );
  }

  const profileUrl = userRole === 'admin' || userRole === 'sub-admin' ? '/admin/settings' : '/settings';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || 'https://placehold.co/100x100.png'} alt={user.displayName || 'User'} data-ai-hint="person" />
            <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'Amulya Digital Member'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={profileUrl}>
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => await signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
