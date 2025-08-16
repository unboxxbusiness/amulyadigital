"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
    pending: {
        label: "Pending",
        color: "hsl(var(--chart-2))",
    },
    approved: {
        label: "Approved",
        color: "hsl(var(--chart-1))",
    },
    rejected: {
        label: "Rejected",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

type RequestData = {
    status: string;
}

export function RequestsChart({ serviceRequestsData }: { serviceRequestsData: RequestData[] }) {
    const data = serviceRequestsData.reduce((acc, request) => {
        const existingStatus = acc.find(entry => entry.status === request.status);
        if (existingStatus) {
            existingStatus.count += 1;
        } else {
            acc.push({ status: request.status, count: 1, fill: `var(--color-${request.status})` });
        }
        return acc;
    }, [] as { status: string; count: number, fill: string }[]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Service Requests</CardTitle>
        <CardDescription>Breakdown of all service requests by status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
