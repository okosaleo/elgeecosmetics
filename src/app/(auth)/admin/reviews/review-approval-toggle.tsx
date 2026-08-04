"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setReviewApproval } from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, CircleX } from "@hugeicons/core-free-icons";

export function ReviewApprovalToggle({
  reviewId,
  approved,
}: {
  reviewId: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setReviewApproval(reviewId, !approved);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(approved ? "Review hidden" : "Review approved");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition ${
        approved
          ? "bg-green-100 text-green-700 hover:bg-neutral-100 hover:text-neutral-600"
          : "bg-amber-100 text-amber-700 hover:bg-green-100 hover:text-green-700"
      }`}
    >
      {approved ? (
        <>
          <HugeiconsIcon icon={CheckIcon} className="h-3 w-3" /> Approved
        </>
      ) : (
        <>
          <HugeiconsIcon icon={CircleX} className="h-3 w-3" /> Pending
        </>
      )}
    </button>
  );
}