import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Contact Us</h1>
        <p className="text-muted-foreground">Have a question? Fill out the form below to get in touch.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Support Request</CardTitle>
          <CardDescription>
            Our team will get back to you within 24-48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your Name" defaultValue="Amulya Creator" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" defaultValue="member@example.com" />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="category">Inquiry Category</Label>
            <Select>
                <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                    <SelectItem value="general">General Question</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Please describe your issue or question in detail." rows={6} />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Send Message</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
