export type OptionView = {
  name: string;
  values: string[];
};

export type VariantView = {
  id: string;
  sku: string;
  price: number; // kobo
  compareAtPrice: number | null;
  stock: number;
  isDefault: boolean;
  options: Record<string, string>; // { Color: "Black", Wattage: "60W" }
};

export function findMatchingVariant(
  variants: VariantView[],
  selections: Record<string, string>,
  optionCount: number
) {
  if (Object.keys(selections).length !== optionCount) return null;
  return (
    variants.find((v) =>
      Object.entries(selections).every(([key, val]) => v.options[key] === val)
    ) ?? null
  );
}