"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon, ShoppingBag, XCircle } from "@hugeicons/core-free-icons";

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem, isBusy, error } =
    useCart();

  // Lock body scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[110] bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      <aside
        className={`fixed right-0 top-0 z-[120] flex h-full w-full max-w-[420px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Your bag {cart.count > 0 && `(${cart.count})`}
          </h2>
          <button onClick={closeCart} aria-label="Close cart">
            <HugeiconsIcon icon={XCircle} className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="bg-red-50 px-5 py-2 text-xs text-red-600">{error}</p>
        )}

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <HugeiconsIcon icon={ShoppingBag} className="h-8 w-8 text-neutral-300" strokeWidth={1.5} />
            <p className="text-sm text-neutral-500">Your bag is empty.</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="text-sm font-medium underline underline-offset-4"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="flex flex-col gap-5">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-neutral-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-neutral-900 hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.variantLabel && (
                          <p className="text-xs text-neutral-500">
                            {item.variantLabel}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isBusy}
                        className="text-xs text-neutral-400 hover:text-neutral-700"
                        aria-label={`Remove ${item.name}`}
                      >
                        <HugeiconsIcon icon={XCircle} className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isBusy}
                          className="flex h-6 w-6 items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <HugeiconsIcon icon={MinusSignIcon} className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-xs">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={
                            isBusy ||
                            (item.stock !== null && item.quantity >= item.stock)
                          }
                          className="flex h-6 w-6 items-center justify-center disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <HugeiconsIcon icon={PlusSignIcon} className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        ₦{(item.lineTotal / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {cart.items.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-semibold">{cart.subtotalFormatted}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center bg-neutral-900 px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-neutral-800"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}