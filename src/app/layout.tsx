
'use client';
import {usePathname} from 'next/navigation';
import {Leaf} from 'lucide-react';
import './globals.css';
import {Sidebar, SidebarProvider, SidebarInset} from '@/components/ui/sidebar';
import {SiteHeader} from '@/components/site-header';
import {MainNav} from '@/components/main-nav';
import {Toaster} from '@/components/ui/toaster';
import {useEffect, useState} from 'react';
import { onAuthStateChanged, User} from 'firebase/auth';
import { auth } from '@/lib/firebase/client-app';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showNav = !['/sign-in', '/sign-up'].includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {mounted ? (
                <>
                  {showNav && user ? (
                    <SidebarProvider>
                      <Sidebar collapsible="icon">
                        <div className="flex flex-col h-full">
                          <div className="p-4">
                            <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                              <Leaf className="size-6 text-accent" />
                              <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Amulya Digital</span>
                            </div>
                          </div>
                          <MainNav />
                        </div>
                      </Sidebar>
                      <SidebarInset>
                        <SiteHeader />
                        <main className="p-4 lg:p-6">{children}</main>
                      </SidebarInset>
                    </SidebarProvider>
                  ) : (
                    <main>{children}</main>
                  )}
                </>
              ) : (
                 <div className="flex items-center justify-center min-h-screen">Loading...</div>
              )}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
