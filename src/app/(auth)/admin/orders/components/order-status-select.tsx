"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrderStatus } from "@/generated/prisma/enums";
import { setOrderStatus } from "../actions";

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-600",
  PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-neutral-200 text-neutral-500",
  REFUNDED: "bg-amber-100 text-amber-700",
};

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: OrderStatus) {
    startTransition(async () => {
      const result = await setOrderStatus(orderId, next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Order marked ${next.toLowerCase()}`);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}