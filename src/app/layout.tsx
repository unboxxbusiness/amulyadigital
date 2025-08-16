import type { Metadata } from "next";
import { Leaf } from 'lucide-react';
import "./globals.css";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { MainNav } from "@/components/main-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Amulya Digital",
  description: "Portal for digital creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar>
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
        <Toaster />
      </body>
    </html>
  );
}
