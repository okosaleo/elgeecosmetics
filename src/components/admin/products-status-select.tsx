"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setProductStatus } from "@/app/(auth)/admin/products/actions";


const statusStyles: Record<string, string> = {
  DRAFT: "bg-neutral-100 text-neutral-600",
  ACTIVE: "bg-green-100 text-green-700",
  ARCHIVED: "bg-amber-100 text-amber-700",
};

export function ProductStatusSelect({
  productId,
  status,
}: {
  productId: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    startTransition(async () => {
      const result = await setProductStatus(
        productId,
        next as "DRAFT" | "ACTIVE" | "ARCHIVED"
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Marked as ${next.toLowerCase()}`);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-md border-0 px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      <option value="DRAFT">Draft</option>
      <option value="ACTIVE">Active</option>
      <option value="ARCHIVED">Archived</option>
    </select>
  );
}