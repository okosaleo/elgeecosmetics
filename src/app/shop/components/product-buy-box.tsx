"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { koboToNaira } from "@/lib/slugify";
import { findMatchingVariant, type OptionView, type VariantView } from "@/lib/variant-utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, Plus } from "@hugeicons/core-free-icons";

type Props = {
  productId: string;
  name: string;
  description: string | null;
  categoryName: string;
  featured: boolean;
  basePrice: number;
  compareAtPrice: number | null;
  sku: string | null;
  options: OptionView[];
  variants: VariantView[];
};

export function ProductBuyBox({
  productId,
  name,
  description,
  categoryName,
  featured,
  basePrice,
  compareAtPrice,
  sku,
  options,
  variants,
}: Props) {
  const { addItem, openCart, isBusy } = useCart();

  const defaultSelections = useMemo(() => {
    const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
    return defaultVariant ? { ...defaultVariant.options } : {};
  }, [variants]);

  const [selections, setSelections] = useState<Record<string, string>>(defaultSelections);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = findMatchingVariant(variants, selections, options.length);

  const price = selectedVariant?.price ?? basePrice;
  const compareAt = selectedVariant?.compareAtPrice ?? compareAtPrice;
  const stock = selectedVariant?.stock ?? null; // null = untracked, simple product
  const displaySku = selectedVariant?.sku ?? sku;

  const outOfStock = options.length > 0 && stock !== null && stock <= 0;
  const incomplete = options.length > 0 && !selectedVariant;

  async function handleAddToCart() {
    setError(null);
    setJustAdded(false);

    if (incomplete) {
      setError("Pick an option for every choice above.");
      return;
    }

    const success = await addItem(productId, selectedVariant?.id ?? null, quantity);
    if (success) {
      setJustAdded(true);
      openCart();
    } else {
      setError("Couldn't add that to your bag — try again.");
    }
  }

  return (
    <div className="flex flex-col">
      <span className="mb-4 inline-block w-fit rounded-sm bg-lime-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-lime-800">
        {featured ? "Best seller" : categoryName}
      </span>

      <h1 className="text-4xl font-normal uppercase tracking-wide text-neutral-900 md:text-5xl">
        {name}
      </h1>

      <div className="mt-4 flex items-center gap-3">
        <span className="text-2xl text-neutral-800">₦{koboToNaira(price)}</span>
        {compareAt && compareAt > price && (
          <span className="text-lg text-neutral-400 line-through">
            ₦{koboToNaira(compareAt)}
          </span>
        )}
      </div>

      {displaySku && (
        <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
          SKU: {displaySku}
        </p>
      )}

      <hr className="my-6 border-neutral-200" />

      {options.length > 0 && (
        <div className="mb-6 flex flex-col gap-5">
          {options.map((option) => (
            <div key={option.name}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                {option.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const active = selections[option.name] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setSelections((s) => ({ ...s, [option.name]: value }))
                      }
                      className={`rounded-sm border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 text-neutral-700 hover:border-neutral-500"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {description && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
            Details
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">{description}</p>
        </div>
      )}

      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-center gap-3 rounded-sm border border-neutral-300 px-3 py-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <HugeiconsIcon icon={MinusSignIcon} className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => (stock !== null ? Math.min(stock, q + 1) : q + 1))
            }
            disabled={stock !== null && quantity >= stock}
            aria-label="Increase quantity"
            className="disabled:opacity-30"
          >
            <HugeiconsIcon icon={Plus} className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isBusy || outOfStock}
          className="flex flex-1 items-center justify-center bg-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? "Out of stock" : isBusy ? "Adding…" : "Add to bag"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {justAdded && !error && (
        <p className="mt-3 text-sm text-neutral-500">Added to your bag.</p>
      )}
    </div>
  );
}