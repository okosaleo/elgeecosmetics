export type DraftImage = {
  url: string;
  key: string;
  alt?: string;
};

export type DraftOption = {
  id: string; // client-only temp id
  name: string; // "Color", "Wattage"
  values: string[]; // ["Black", "White"]
};

export type DraftVariant = {
  id: string; // client-only temp id
  combination: Record<string, string>; // { Color: "Black", Wattage: "60W" }
  sku: string;
  price: string; // naira, as typed
  compareAtPrice: string;
  stock: string;
  weightGrams: string;
  isDefault: boolean;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  brandId: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  sku: string;
  basePrice: string; // naira, only used when there are no variants
  compareAtPrice: string;
  images: DraftImage[];
  options: DraftOption[];
  variants: DraftVariant[];
};

export const emptyProductForm: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  brandId: "",
  status: "DRAFT",
  featured: false,
  sku: "",
  basePrice: "",
  compareAtPrice: "",
  images: [],
  options: [],
  variants: [],
};

/** Cartesian product of each option's values, merged with any existing
 *  variant rows so prices/stock the admin already typed aren't lost. */
export function buildVariants(
  options: DraftOption[],
  existing: DraftVariant[]
): DraftVariant[] {
  const usableOptions = options.filter((o) => o.name.trim() && o.values.length > 0);
  if (usableOptions.length === 0) return [];

  let combos: Record<string, string>[] = [{}];
  for (const option of usableOptions) {
    const next: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const value of option.values) {
        next.push({ ...combo, [option.name]: value });
      }
    }
    combos = next;
  }

  return combos.map((combination, index) => {
    const match = existing.find(
      (v) => JSON.stringify(v.combination) === JSON.stringify(combination)
    );
    return (
      match ?? {
        id: `variant-${Date.now()}-${index}`,
        combination,
        sku: "",
        price: "",
        compareAtPrice: "",
        stock: "0",
        weightGrams: "",
        isDefault: index === 0,
      }
    );
  });
}