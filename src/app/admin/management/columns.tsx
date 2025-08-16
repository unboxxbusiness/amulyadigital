"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type AdminUser = {
    uid: string;
    email: string;
    role: string;
}

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: "email",
    header: "Admin Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
          {role}
        </Badge>
      )
    },
  },
]
