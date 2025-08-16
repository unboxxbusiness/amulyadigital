"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"

export type Message = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  submittedAt: string;
  status: string;
}

export const columns: ColumnDef<Message>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "From",
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      )
    }
  },
  {
    accessorKey: "category",
    header: "Category",
     cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>
  },
   {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">
        {row.original.message}
      </div>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: "Received",
     cell: ({ row }) => {
      const date = new Date(row.getValue("submittedAt"))
      return <div>{format(date, "PPP p")}</div>
    }
  },
]
