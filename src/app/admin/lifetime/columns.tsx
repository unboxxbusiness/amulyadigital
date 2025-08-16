"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { approveLifetimeMembership } from "@/app/profile/actions";

export type LifetimeApplication = {
    uid: string;
    name: string;
    email: string;
}

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
    id: "actions",
    cell: ({ row }) => {
      const application = row.original;
      return (
         <form action={approveLifetimeMembership}>
            <input type="hidden" name="uid" value={application.uid} />
            <Button variant="outline" size="sm" type="submit">
                <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                Approve Lifetime
            </Button>
        </form>
      );
    },
  },
];
