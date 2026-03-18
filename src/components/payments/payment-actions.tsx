"use client";

import { updatePaymentStatus } from "@/lib/actions/tasks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, CircleDollarSign, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

const paymentOptions = [
  { value: "UNPAID", label: "Belum Dibayar", icon: XCircle, color: "text-red-400" },
  { value: "DP", label: "Uang Muka", icon: CircleDollarSign, color: "text-amber-400" },
  { value: "AWAITING_VERIFICATION", label: "Menunggu Verifikasi", icon: Clock, color: "text-purple-400" },
  { value: "PAID", label: "Lunas", icon: Check, color: "text-emerald-400" },
];

export function PaymentActions({
  taskId,
  currentStatus,
}: {
  taskId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (status: string) => {
    startTransition(async () => {
      const result = await updatePaymentStatus(taskId, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Status pembayaran diperbarui");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending} />}
      >
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {paymentOptions
          .filter((opt) => opt.value !== currentStatus)
          .map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              className="gap-2 cursor-pointer"
              onClick={() => handleChange(opt.value)}
            >
              <opt.icon className={`w-4 h-4 ${opt.color}`} />
              {opt.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
