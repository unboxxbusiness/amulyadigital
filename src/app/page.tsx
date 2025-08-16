'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

const announcements = [
  {
    title: "Annual Creator Summit 2024",
    date: "August 15, 2024",
    description: "Join us for our biggest event of the year! We'll have workshops, networking sessions, and talks from industry leaders. Registration opens next week."
  },
  {
    title: "New Collaboration Opportunities",
    date: "July 28, 2024",
    description: "We've partnered with three new brands looking for digital creators. Check the opportunities board for more details and how to apply."
  },
  {
    title: "Portal Maintenance Scheduled",
    date: "July 25, 2024",
    description: "The member portal will be down for scheduled maintenance on July 30th from 2:00 AM to 4:00 AM EST. We apologize for any inconvenience."
  },
    {
    title: "Welcome New Members!",
    date: "July 22, 2024",
    description: "A big welcome to all the new creators who joined us this month! We're excited to have you as part of the Amulya Digital community."
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to the Amulya Digital portal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="size-5" />
            Announcements
          </CardTitle>
          <CardDescription>
            Organization-wide news and updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {announcements.map((announcement, index) => (
              <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-1 before:h-4 before:w-4 before:rounded-full before:bg-primary/20 before:border-2 before:border-primary">
                <p className="text-sm text-muted-foreground">{announcement.date}</p>
                <h3 className="font-semibold">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground">{announcement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
