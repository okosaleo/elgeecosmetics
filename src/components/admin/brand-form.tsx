"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/slugify";
import { createBrand, updateBrand } from "@/app/(auth)/admin/categories/actions";
import { SingleImageUploader } from "../single-image-uploader";

type Props = {
  brandId?: string;
  initial?: { name: string; slug: string; logo: string | null };
};

export function BrandForm({ brandId, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [logo, setLogo] = useState<string | null>(initial?.logo ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Name is required.");

    const payload = { name, slug: slug || slugify(name), logo };

    startTransition(async () => {
      const result = brandId
        ? await updateBrand(brandId, payload)
        : await createBrand(payload);
      if (result && !result.ok) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Neewer"
          required
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div>
        <Label className="mb-2 block">Logo</Label>
        <SingleImageUploader endpoint="brandLogo" value={logo} onChange={setLogo} />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : brandId ? "Save changes" : "Create brand"}
        </Button>
      </div>
    </form>
  );
}