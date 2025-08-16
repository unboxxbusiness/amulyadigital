
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Check, X } from "lucide-react"
import { updateServiceRequestStatus } from "@/app/services/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { isAfter, isBefore, isEqual } from "date-fns"

export type ServiceRequest = {
    id: string;
    memberId: string;
    name: string;
    email: string;
    serviceName: string;
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

export const columns: ColumnDef<ServiceRequest>[] = [
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
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "memberId",
    header: "Member ID",
  },
  {
    accessorKey: "serviceName",
    header: "Service",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Submitted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="pl-4">{date.toLocaleDateString()}</div>
    },
    filterFn: (row, columnId, filterValue: any) => {
        const date = new Date(row.getValue(columnId));
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={
              status === "pending" ? "secondary" : 
              status === "approved" ? "default" : "destructive"
          }
          className={status === "approved" ? "bg-accent text-accent-foreground" : ""}
        >
          {status}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const request = row.original
      if (request.status !== "pending") {
          return null
      }
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <form action={updateServiceRequestStatus}>
              <input type="hidden" name="requestId" value={request.id} />
              <input type="hidden" name="status" value="approved" />
              <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                  <button type="submit" className="w-full text-left">
                    <Check className="mr-2 h-4 w-4 text-accent" />
                    Approve
                  </button>
              </DropdownMenuItem>
            </form>
             <form action={updateServiceRequestStatus}>
              <input type="hidden" name="requestId" value={request.id} />
              <input type="hidden" name="status" value="rejected" />
              <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                  <button type="submit" className="w-full text-left">
                    <X className="mr-2 h-4 w-4 text-destructive" />
                    Reject
                  </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
