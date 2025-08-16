"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Check, X } from "lucide-react"
import { revalidatePath } from "next/cache"
import { adminAuth, adminDb } from "@/lib/firebase/admin-app"
import { FieldValue } from "firebase-admin/firestore"

export type Application = {
  uid: string;
  name: string;
  email: string;
  submitted: Date;
  status: string;
}

async function approveUser(uid: string) {
    'use server';
    const counterRef = adminDb.collection('counters').doc('memberIdCounter');
    const userRef = adminDb.collection('users').doc(uid);

    await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        
        let newCount;
        if (!counterDoc.exists) {
            newCount = 1;
        } else {
            const currentYear = new Date().getFullYear();
            const lastResetYear = counterDoc.data()?.lastResetYear || 0;
            if (currentYear > lastResetYear) {
                newCount = 1;
                transaction.set(counterRef, { count: newCount, lastResetYear: currentYear }, { merge: true });
            } else {
                newCount = (counterDoc.data()?.count || 0) + 1;
            }
        }
        
        const year = new Date().getFullYear();
        const memberId = `NGO-${year}-${String(newCount).padStart(4, '0')}`;
        
        transaction.update(userRef, { 
            status: 'active',
            memberId: memberId,
        });

        if (counterDoc.exists) {
            transaction.update(counterRef, { count: FieldValue.increment(1) });
        } else {
            transaction.set(counterRef, { count: newCount, lastResetYear: year });
        }
    });

    await adminAuth.setCustomUserClaims(uid, { role: 'member', status: 'active' });
    revalidatePath('/admin/applications');
}

async function rejectUser(uid: string) {
    'use server';
    await adminDb.collection('users').doc(uid).delete();
    await adminAuth.deleteUser(uid);
    revalidatePath('/admin/applications');
}

export const columns: ColumnDef<Application>[] = [
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
    accessorKey: "submitted",
    header: "Submitted",
    cell: ({ row }) => {
      const date = new Date(row.getValue("submitted"))
      return <div>{date.toLocaleDateString()}</div>
    }
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
