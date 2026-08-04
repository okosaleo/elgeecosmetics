"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useCart } from "./cart-provider";
import { ShoppingBag } from "@hugeicons/core-free-icons";

export function CartButton({ textColor = "#17301C" }: { textColor?: string }) {
  const { cart, openCart } = useCart();
  const visible = cart.count > 0;

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart, ${cart.count} item${cart.count === 1 ? "" : "s"}`}
      className={`relative flex h-6 w-6 shrink-0 items-center justify-center transition-all duration-300 ${
        visible
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-75 opacity-0"
      }`}
      style={{ color: textColor }}
      tabIndex={visible ? 0 : -1}
    >
      <HugeiconsIcon icon={ShoppingBag} className="h-[18px] w-[18px]" strokeWidth={1.75} />
      {cart.count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-medium leading-none text-white">
          {cart.count > 99 ? "99+" : cart.count}
        </span>
      )}
    </button>
  );
}