
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { LifetimeApplication } from "./page";
import { UpdateLifetimeStatusDialog } from "./update-status-dialog";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<LifetimeApplication>[] = [
  {
    accessorKey: "name",
    header: "Applicant Name",
  },
  {
    accessorKey: "memberId",
    header: "Member ID",
    cell: ({ row }) => row.original.memberId || "N/A",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
   {
    accessorKey: "lifetimeStatus",
    header: "Status",
     cell: ({ row }) => {
      const status = row.original.lifetimeStatus;
      return (
        <Badge variant={status === 'approved' ? 'default' : status === 'applied' ? 'secondary' : 'outline'}>
          {status}
        </Badge>
      );
    }
  },
  {
    accessorKey: "lifetimeStartDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Activated On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const startDate = row.original.lifetimeStartDate;
      return startDate ? <div className="pl-4">{format(new Date(startDate), "PPP")}</div> : <div className="pl-4">N/A</div>;
    },
    filterFn: (row, columnId, filterValue: any) => {
        const dateStr = row.getValue(columnId) as string | undefined;
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const { from, to } = filterValue;
        if (from && !to) {
            return isEqual(date, from) || isAfter(date, from);
        } else if (!from && to) {
            return isEqual(date, to) || isBefore(date, to);
        } else if (from && to) {
            return (isEqual(date, from) || isAfter(date, from)) && (isEqual(date, to) || isBefore(date, to));
        }
        return true;
    },
  },
  {
    accessorKey: "lifetimeExpiry",
    header: "Expires On",
    cell: ({ row }) => {
      const expiry = row.original.lifetimeExpiry;
      return expiry ? format(new Date(expiry), "PPP") : "N/A";
    }
  },
  {
    accessorKey: "paymentTransactionId",
    header: "Transaction ID",
    cell: ({ row }) => row.original.paymentTransactionId || "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const application = row.original;
      return <UpdateLifetimeStatusDialog application={application} />;
    },
  },
];
