
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Check, X } from "lucide-react"
import { approveUser, rejectUser } from "./actions"
import { Checkbox } from "@/components/ui/checkbox"
import type { Application } from "./page"
import { isAfter, isBefore, isEqual } from 'date-fns';

export const columns: ColumnDef<Application>[] = [
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Applicant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const application = row.original
        return (
            <div className="pl-4">
                <div className="font-medium">{application.name}</div>
                <div className="text-sm text-muted-foreground">{application.email}</div>
            </div>
        )
    }
  },
  {
    accessorKey: "memberId",
    header: "Member ID",
    cell: ({ row }) => {
      return <div>{row.original.memberId || "N/A"}</div>
    }
  },
  {
    accessorKey: "submitted",
    header: "Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("submitted"))
      return <div>{date.toLocaleDateString()}</div>
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
              status === "active" ? "default" : "destructive"
          }
          className={status === "active" ? "bg-accent text-accent-foreground" : ""}
        >
          {status}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const application = row.original
      if (application.status !== "pending") {
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
            <DropdownMenuItem
                onClick={() => approveUser(application.uid)}
                className="text-accent cursor-pointer"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => rejectUser(application.uid)}
                className="text-destructive cursor-pointer"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
