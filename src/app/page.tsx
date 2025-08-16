
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, DollarSign, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Empowering Communities, Changing Lives
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join us in our mission to bring positive change. Your support helps us provide essential resources and create a brighter future for those in need.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/contact">
                    <Button size="lg">
                      Donate Now
                    </Button>
                  </Link>
                   <Link href="/sign-up">
                    <Button size="lg" variant="outline">
                      Become a Volunteer
                    </Button>
                  </Link>
                </div>
              </div>
               <Image
                src="https://placehold.co/600x400.png"
                width="600"
                height="400"
                alt="Happy people"
                data-ai-hint="community volunteering"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Making a Difference, Together</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We are dedicated to tackling the most pressing challenges facing our communities. From providing education and healthcare to supporting sustainable development, we work tirelessly to create lasting impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volunteers Engaged</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+1,200</div>
                  <p className="text-xs text-muted-foreground">dedicated individuals making a change</p>
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+50,000</div>
                  <p className="text-xs text-muted-foreground">across various community projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Funds Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1.5M</div>
                  <p className="text-xs text-muted-foreground">to support our ongoing initiatives</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ready to Make an Impact?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whether you want to donate, volunteer, or simply learn more, there's a place for you here. Join our community and be a part of something bigger.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Link href="/sign-up">
                  <Button size="lg" className="w-full">
                    Get Involved Today <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Amulya Digital NGO. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
