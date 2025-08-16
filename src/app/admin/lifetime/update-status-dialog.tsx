"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { LifetimeApplication } from "./page";
import { updateLifetimeMembership } from "@/app/profile/actions";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function UpdateLifetimeStatusDialog({ application }: { application: LifetimeApplication }) {
  const [open, setOpen] = useState(false);
  const [transactionId, setTransactionId] = useState(application.paymentTransactionId || "");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!transactionId || !startDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a transaction ID and a start date.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("uid", application.uid);
    formData.append("transactionId", transactionId);
    formData.append("startDate", startDate.toISOString());
    
    const result = await updateLifetimeMembership(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.error,
      });
    } else {
      toast({
        title: "Success",
        description: "Lifetime membership has been approved and updated.",
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Update Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Lifetime Membership</DialogTitle>
          <DialogDescription>
            Approve the 5-year lifetime membership for {application.name}. Enter payment details below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transactionId" className="text-right">
              Transaction ID
            </Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Start Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
