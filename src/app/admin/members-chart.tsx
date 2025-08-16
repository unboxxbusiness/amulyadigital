"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  members: {
    label: "Members",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type MemberData = {
    createdAt: Date;
    status: string;
}

export function MembersChart({ allMembersData }: { allMembersData: MemberData[] }) {
    const data = allMembersData
        .filter(member => member.status === 'active')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .reduce((acc, member) => {
            const month = member.createdAt.toLocaleString('default', { month: 'short' });
            const existingEntry = acc.find(entry => entry.month === month);
            if (existingEntry) {
                existingEntry.members += 1;
            } else {
                acc.push({ month, members: 1 });
            }
            return acc;
        }, [] as { month: string; members: number }[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Growth</CardTitle>
        <CardDescription>New active members per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="members" fill="var(--color-members)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total new members per month
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
