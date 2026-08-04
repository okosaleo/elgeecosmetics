"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { ProductImageUploader } from "./product-image-uploader";
import { VariantBuilder } from "./variant-builder";
import { emptyProductForm, ProductFormValues } from "./product-form-types";
import { slugify } from "@/lib/slugify";
import { createProduct } from "../products/actions";

type Props = {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
};

export function ProductForm({ categories, brands }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(emptyProductForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // isPending only updates on the next render, which leaves a window for a
  // fast double-click (or Enter-triggered implicit submit) to fire this
  // twice. This ref is checked synchronously, so the second call bails
  // immediately regardless of render timing.
  const submittingRef = useRef(false);

  const hasVariants = values.options.some(
    (o) => o.name.trim() && o.values.length > 0
  );

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleNameChange(name: string) {
    set("name", name);
    if (!slugTouched) set("slug", slugify(name));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (submittingRef.current) return; // already in flight — ignore
    setError(null);

    if (!values.name.trim()) return setError("Product name is required.");
    if (!values.categoryId) return setError("Pick a category.");
    if (!hasVariants && !values.basePrice) {
      return setError("Set a base price, or add variants with their own prices.");
    }
    if (hasVariants && values.variants.some((v) => !v.price)) {
      return setError("Every variant needs a price.");
    }

    submittingRef.current = true;

    startTransition(async () => {
      try {
        const result = await createProduct(values);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        toast.success(`"${values.name}" created`);
        router.push(`/admin/products`);
      } finally {
        submittingRef.current = false;
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ring Light Pro 18-inch"
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="ring-light-pro-18-inch"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={values.categoryId}
                onValueChange={(v) => set("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Brand</Label>
              <Select value={values.brandId} onValueChange={(v) => set("brandId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => set("status", v as ProductFormValues["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => set("featured", e.target.checked)}
              />
              Featured
            </label>
          </div>
        </CardContent>
      </Card>

      {!hasVariants && (
        <Card>
          <CardContent className="grid grid-cols-3 gap-4 p-5">
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={values.sku}
                onChange={(e) => set("sku", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="basePrice">Price (₦)</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={values.basePrice}
                onChange={(e) => set("basePrice", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Compare at (₦)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                value={values.compareAtPrice}
                onChange={(e) => set("compareAtPrice", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <Label className="mb-3 block text-sm font-medium">Images</Label>
          <ProductImageUploader
            images={values.images}
            onChange={(images) => set("images", images)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <VariantBuilder
            options={values.options}
            variants={values.variants}
            onChange={(options, variants) => {
              set("options", options);
              set("variants", variants);
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Create product"}
        </Button>
      </div>
    </form>
  );
}