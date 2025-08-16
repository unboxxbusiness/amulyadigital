import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Membership Application</h1>
        <p className="text-muted-foreground">Apply for membership or track your application status.</p>
      </div>

      <Tabs defaultValue="apply" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="apply">Apply for Membership</TabsTrigger>
          <TabsTrigger value="status">Track Status</TabsTrigger>
        </TabsList>
        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Application Form</CardTitle>
              <CardDescription>
                Fill out the form below to apply to Amulya Digital. We'll review your application and get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio or Social Media URL</Label>
                <Input id="portfolio" placeholder="https://your-work.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Why do you want to join?</Label>
                <Textarea id="reason" placeholder="Tell us about your work and why you'd be a good fit..." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Submit Application</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>
                Here is the current status of your membership application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <p className="font-medium">Current Status: <span className="text-primary font-bold">Under Review</span></p>
                    <p className="text-sm text-muted-foreground">Submitted on: July 29, 2024</p>
                </div>
                <div className="space-y-2">
                    <Label>Progress</Label>
                    <Progress value={50} aria-label="50% complete" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Submitted</span>
                        <span>In Review</span>
                        <span>Decision</span>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <p className="text-sm text-muted-foreground">
                        Our team is currently reviewing your application. This process typically takes 5-7 business days. You will receive an email notification once a decision has been made. Thank you for your patience!
                    </p>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
