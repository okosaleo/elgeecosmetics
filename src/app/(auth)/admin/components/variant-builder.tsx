"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DraftOption,
  DraftVariant,
  buildVariants,
} from "./product-form-types";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel02FreeIcons, Cancel02Icon, PlusSignSquareIcon } from "@hugeicons/core-free-icons";

type Props = {
  options: DraftOption[];
  variants: DraftVariant[];
  onChange: (options: DraftOption[], variants: DraftVariant[]) => void;
};

export function VariantBuilder({ options, variants, onChange }: Props) {
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});

  function addOption() {
    const next = [
      ...options,
      { id: `opt-${Date.now()}`, name: "", values: [] },
    ];
    onChange(next, buildVariants(next, variants));
  }

  function updateOptionName(id: string, name: string) {
    const next = options.map((o) => (o.id === id ? { ...o, name } : o));
    onChange(next, buildVariants(next, variants));
  }

  function removeOption(id: string) {
    const next = options.filter((o) => o.id !== id);
    onChange(next, buildVariants(next, variants));
  }

  function addValue(optionId: string) {
    const raw = (valueDrafts[optionId] ?? "").trim();
    if (!raw) return;
    const next = options.map((o) =>
      o.id === optionId && !o.values.includes(raw)
        ? { ...o, values: [...o.values, raw] }
        : o
    );
    onChange(next, buildVariants(next, variants));
    setValueDrafts((d) => ({ ...d, [optionId]: "" }));
  }

  function removeValue(optionId: string, value: string) {
    const next = options.map((o) =>
      o.id === optionId
        ? { ...o, values: o.values.filter((v) => v !== value) }
        : o
    );
    onChange(next, buildVariants(next, variants));
  }

  function updateVariant(id: string, patch: Partial<DraftVariant>) {
    onChange(
      options,
      variants.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm font-medium">Options</Label>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <HugeiconsIcon icon={PlusSignSquareIcon} />
            Add option
          </Button>
        </div>
        <p className="mb-3 text-xs text-neutral-500">
          e.g. Color, Wattage, Size — leave empty if this product doesn&apos;t
          need variants (a single tripod SKU, for instance).
        </p>

        <div className="space-y-3">
          {options.map((option) => (
            <Card key={option.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Option name (e.g. Color)"
                    value={option.name}
                    onChange={(e) => updateOptionName(option.id, e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                  >
                   <HugeiconsIcon icon={Cancel02FreeIcons} />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {option.values.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1">
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValue(option.id, value)}
                        aria-label={`Remove ${value}`}
                      >
                        <HugeiconsIcon icon={Cancel02Icon} />
                      </button>
                    </Badge>
                  ))}
                  <Input
                    placeholder="Add value + Enter"
                    value={valueDrafts[option.id] ?? ""}
                    onChange={(e) =>
                      setValueDrafts((d) => ({ ...d, [option.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addValue(option.id);
                      }
                    }}
                    className="h-8 w-36"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {variants.length > 0 && (
        <div>
          <Label className="mb-2 block text-sm font-medium">
            Variants ({variants.length})
          </Label>
          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="w-full min-w-160 text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Combination</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Price (₦)</th>
                  <th className="px-3 py-2">Compare at</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Default</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2 font-medium text-neutral-700">
                      {Object.values(v.combination).join(" / ")}
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={v.sku}
                        onChange={(e) =>
                          updateVariant(v.id, { sku: e.target.value })
                        }
                        className="h-8 w-32"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={v.price}
                        onChange={(e) =>
                          updateVariant(v.id, { price: e.target.value })
                        }
                        className="h-8 w-24"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={v.compareAtPrice}
                        onChange={(e) =>
                          updateVariant(v.id, { compareAtPrice: e.target.value })
                        }
                        className="h-8 w-24"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) =>
                          updateVariant(v.id, { stock: e.target.value })
                        }
                        className="h-8 w-20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="radio"
                        name="default-variant"
                        checked={v.isDefault}
                        onChange={() =>
                          onChange(
                            options,
                            variants.map((x) => ({
                              ...x,
                              isDefault: x.id === v.id,
                            }))
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}