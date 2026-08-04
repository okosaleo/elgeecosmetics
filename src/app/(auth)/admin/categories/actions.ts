"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { ok: true } | { ok: false; error: string };

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

async function uniqueSlug(slug: string, ignoreId?: string) {
  let candidate = slug;
  let suffix = 1;
  while (
    await prisma.category.findFirst({
      where: { slug: candidate, NOT: ignoreId ? { id: ignoreId } : undefined },
    })
  ) {
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }
  return candidate;
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(slugify(data.slug || data.name));

  const created = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      parentId: data.parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  redirect(`/admin/categories`);
  return { ok: true };
}

export async function updateCategory(
  id: string,
  input: unknown
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;

  if (data.parentId === id) {
    return { ok: false, error: "A category can't be its own parent." };
  }

  const slug = await uniqueSlug(slugify(data.slug || data.name), id);

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      parentId: data.parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  redirect(`/admin/categories`);
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await requireAdmin();

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);

  if (childCount > 0) {
    return {
      ok: false,
      error: `Can't delete — ${childCount} subcategor${childCount === 1 ? "y" : "ies"} still reference this.`,
    };
  }
  if (productCount > 0) {
    return {
      ok: false,
      error: `Can't delete — ${productCount} product${productCount === 1 ? "" : "s"} still use this category.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

// ────────────────────────────────────────────────────────────
// BRANDS
// ────────────────────────────────────────────────────────────

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().url().optional().nullable(),
});

async function uniqueBrandSlug(slug: string, ignoreId?: string) {
  let candidate = slug;
  let suffix = 1;
  while (
    await prisma.brand.findFirst({
      where: { slug: candidate, NOT: ignoreId ? { id: ignoreId } : undefined },
    })
  ) {
    suffix += 1;
    candidate = `${slug}-${suffix}`;
  }
  return candidate;
}

export async function createBrand(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;
  const slug = await uniqueBrandSlug(slugify(data.slug || data.name));

  try {
    await prisma.brand.create({
      data: { name: data.name, slug, logo: data.logo || null },
    });
  } catch {
    return { ok: false, error: "A brand with that name already exists." };
  }

  revalidatePath("/admin/categories");
  redirect(`/admin/categories?tab=brands`);
  return { ok: true };
}

export async function updateBrand(id: string, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = brandSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;
  const slug = await uniqueBrandSlug(slugify(data.slug || data.name), id);

  await prisma.brand.update({
    where: { id },
    data: { name: data.name, slug, logo: data.logo || null },
  });

  revalidatePath("/admin/categories");
  redirect(`/admin/categories?tab=brands`);
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  await requireAdmin();
  // Product.brand is optional with a SetNull relation, so this is always
  // safe — existing products just fall back to "no brand" instead of blocking.
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}