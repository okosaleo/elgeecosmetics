"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Trash2 } from "@hugeicons/core-free-icons";

type ActionResult = { ok: true } | { ok: false; error: string };

export function DeleteButton({
  id,
  action,
  confirmMessage,
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={handleClick}
        aria-label="Delete"
      >
        <HugeiconsIcon icon={Trash2} className="h-4 w-4 text-neutral-500 hover:text-red-600" />
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}