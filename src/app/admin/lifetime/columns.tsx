"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { LifetimeApplication } from "./page";
import { UpdateLifetimeStatusDialog } from "./update-status-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const columns: ColumnDef<LifetimeApplication>[] = [
  {
    accessorKey: "name",
    header: "Applicant Name",
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
