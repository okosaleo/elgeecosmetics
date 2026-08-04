"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


import { slugify } from "@/lib/slugify";
import { createCategory, updateCategory } from "@/app/(auth)/admin/categories/actions";
import { SingleImageUploader } from "../single-image-uploader";

type CategoryOption = { id: string; name: string; depth: number };

type Props = {
  categoryId?: string;
  initial?: {
    name: string;
    slug: string;
    description: string;
    image: string | null;
    parentId: string | null;
  };
  parentOptions: CategoryOption[];
};

export function CategoryForm({ categoryId, initial, parentOptions }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState<string | null>(initial?.image ?? null);
  const [parentId, setParentId] = useState<string>(initial?.parentId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Name is required.");

    const payload = {
      name,
      slug: slug || slugify(name),
      description,
      image,
      parentId: parentId || null,
    };

    startTransition(async () => {
      const result = categoryId
        ? await updateCategory(categoryId, payload)
        : await createCategory(payload);
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
          placeholder="Lighting"
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>Parent category</Label>
        <Select value={parentId || "none"} onValueChange={(v) => setParentId(v === "none" ? "" : v)}>
          <SelectTrigger>
            <SelectValue placeholder="None (top-level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (top-level)</SelectItem>
            {parentOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {"—".repeat(c.depth)} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">Image</Label>
        <SingleImageUploader endpoint="categoryImage" value={image} onChange={setImage} />
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : categoryId ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  );
}