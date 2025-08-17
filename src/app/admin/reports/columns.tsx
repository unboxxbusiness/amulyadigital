
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { format, isAfter, isBefore, isEqual } from "date-fns"

// User Columns
export type User = {
    uid: string;
    name: string;
    email: string;
    role: 'admin' | 'sub-admin' | 'member';
    status: 'active' | 'pending';
    createdAt: string;
    memberId?: string;
}

export const userColumns: ColumnDef<User>[] = [
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
    cell: ({ row }) => row.original.memberId || 'N/A',
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant={row.original.role === 'member' ? 'secondary' : 'default'}>{row.original.role}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'} className={row.original.status === 'active' ? "bg-accent text-accent-foreground" : ""}>{row.original.status}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Registered On
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="pl-4">{format(new Date(row.original.createdAt), "PPP")}</div>,
    filterFn: (row, columnId, filterValue: any) => {
        const date = new Date(row.getValue(columnId));
        const { from, to } = filterValue;
        if (from && !to) return isEqual(date, from) || isAfter(date, from);
        if (!from && to) return isEqual(date, to) || isBefore(date, to);
        if (from && to) return (isEqual(date, from) || isAfter(date, from)) && (isEqual(date, to) || isBefore(date, to));
        return true;
    },
  },
];

// Service Request Columns (from admin/services/columns)
export type ServiceRequest = {
    id: string;
    memberId: string;
    name: string;
    email: string;
    serviceName: string;
    createdAt: string;
    status: "pending" | "approved" | "rejected";
}

export const serviceRequestColumns: ColumnDef<ServiceRequest>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "memberId", header: "Member ID" },
  { accessorKey: "serviceName", header: "Service" },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Submitted
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="pl-4">{format(new Date(row.original.createdAt), "PPP")}</div>,
    filterFn: (row, columnId, filterValue: any) => {
        const date = new Date(row.getValue(columnId));
        const { from, to } = filterValue;
        if (from && !to) return isEqual(date, from) || isAfter(date, from);
        if (!from && to) return isEqual(date, to) || isBefore(date, to);
        if (from && to) return (isEqual(date, from) || isAfter(date, from)) && (isEqual(date, to) || isBefore(date, to));
        return true;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "pending" ? "secondary" : status === "approved" ? "default" : "destructive"} className={status === "approved" ? "bg-accent text-accent-foreground" : ""}>
          {status}
        </Badge>
      )
    }
  },
];


// Inbox Message Columns (from admin/inbox/columns)
export type Message = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  submittedAt: string;
  status: string;
}

export const messageColumns: ColumnDef<Message>[] = [
  {
    accessorKey: "name",
    header: "From",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-muted-foreground">{row.original.email}</div>
      </div>
    )
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => <div className="max-w-xs truncate">{row.original.message}</div>,
  },
  {
    accessorKey: "submittedAt",
    header: "Received",
    cell: ({ row }) => <div>{format(new Date(row.getValue("submittedAt")), "PPP p")}</div>,
    filterFn: (row, columnId, filterValue: any) => {
        const date = new Date(row.getValue(columnId));
        const { from, to } = filterValue;
        if (from && !to) return isEqual(date, from) || isAfter(date, from);
        if (!from && to) return isEqual(date, to) || isBefore(date, to);
        if (from && to) return (isEqual(date, from) || isAfter(date, from)) && (isEqual(date, to) || isBefore(date, to));
        return true;
    },
  },
];
