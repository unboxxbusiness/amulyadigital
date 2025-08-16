import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Profile</h1>
        <p className="text-muted-foreground">View and edit your profile information.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your personal and professional information here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" defaultValue="Amulya Creator" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="member@example.com" disabled />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio URL</Label>
            <Input id="portfolio" defaultValue="https://my-awesome-portfolio.com" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea id="bio" placeholder="Tell us a little bit about yourself" defaultValue="Digital artist and content creator focused on nature-inspired designs and minimalist aesthetics."/>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
