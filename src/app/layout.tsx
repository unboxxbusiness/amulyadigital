
import type { Metadata } from "next";
import { Leaf } from "lucide-react";
import "./globals.css";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { MainNav } from "@/components/main-nav";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseAuthListener } from "@/components/firebase-auth-listener";
import { GoogleAnalytics } from "@/components/google-analytics";
import { verifySession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Amulya Digital",
  description: "Member portal for Amulya Digital",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await verifySession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseAuthListener />
          {session ? (
            <SidebarProvider>
              <Sidebar>
                <div className="flex flex-col h-full">
                  <div className="p-4 flex items-center gap-2">
                    <Leaf className="size-8 text-primary" />
                    <h1 className="text-xl font-bold font-headline text-primary">Amulya Digital</h1>
                  </div>
                  <MainNav />
                </div>
              </Sidebar>
              <div className="flex flex-col w-full">
                <SiteHeader />
                <main className="p-4 sm:p-6 lg:p-8 flex-1">
                  {children}
                </main>
              </div>
            </SidebarProvider>
          ) : (
             <div className="min-h-screen bg-background">
              {children}
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
