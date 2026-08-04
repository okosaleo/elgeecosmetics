
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { nairaToKobo } from "@/lib/slugify";
import { revalidatePath } from "next/cache";

const draftImageSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  alt: z.string().optional(),
});

const draftOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  values: z.array(z.string().min(1)).min(1),
});

const draftVariantSchema = z.object({
  id: z.string(),
  combination: z.record(z.string(), z.string()),
  sku: z.string().optional(),
  price: z.string().min(1),
  compareAtPrice: z.string().optional(),
  stock: z.string().optional(),
  weightGrams: z.string().optional(),
  isDefault: z.boolean(),
});

const productFormSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  featured: z.boolean(),
  sku: z.string().optional(),
  basePrice: z.string().optional(),
  compareAtPrice: z.string().optional(),
  images: z.array(draftImageSchema),
  options: z.array(draftOptionSchema),
  variants: z.array(draftVariantSchema),
});

type ActionResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

export async function createProduct(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;

  const usableOptions = data.options.filter(
    (o) => o.name.trim() && o.values.length > 0
  );
  const hasVariants = usableOptions.length > 0;

  if (!hasVariants && !data.basePrice) {
    return { ok: false, error: "Base price is required when there are no variants." };
  }
  if (hasVariants && data.variants.some((v) => !v.price)) {
    return { ok: false, error: "Every variant needs a price." };
  }

  // Slug uniqueness check with auto-suffix
  let slug = data.slug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${data.slug}-${suffix}`;
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          status: data.status,
          featured: data.featured,
          categoryId: data.categoryId,
          brandId: data.brandId || null,
          sku: hasVariants ? null : data.sku || null,
          basePrice: hasVariants ? 0 : nairaToKobo(data.basePrice || "0"),
          compareAtPrice:
            !hasVariants && data.compareAtPrice
              ? nairaToKobo(data.compareAtPrice)
              : null,
          images: {
            create: data.images.map((img, position) => ({
              url: img.url,
              alt: img.alt,
              position,
            })),
          },
        },
      });

      if (hasVariants) {
        // Create options + their values, keep a value-id lookup keyed by
        // "OptionName::Value" so we can wire up the join table below.
        const valueIdByKey = new Map<string, string>();

        for (const [position, option] of usableOptions.entries()) {
          const createdOption = await tx.productOption.create({
            data: { productId: created.id, name: option.name, position },
          });

          for (const [valuePosition, value] of option.values.entries()) {
            const createdValue = await tx.productOptionValue.create({
              data: {
                optionId: createdOption.id,
                value,
                position: valuePosition,
              },
            });
            valueIdByKey.set(`${option.name}::${value}`, createdValue.id);
          }
        }

        for (const variant of data.variants) {
          const optionValueIds = Object.entries(variant.combination).map(
            ([optionName, value]) => {
              const id = valueIdByKey.get(`${optionName}::${value}`);
              if (!id) throw new Error(`Missing option value for ${optionName}: ${value}`);
              return id;
            }
          );

          await tx.productVariant.create({
            data: {
              productId: created.id,
              sku:
                variant.sku?.trim() ||
                `${slug}-${optionValueIds.join("-").slice(0, 12)}`,
              price: nairaToKobo(variant.price),
              compareAtPrice: variant.compareAtPrice
                ? nairaToKobo(variant.compareAtPrice)
                : null,
              stock: variant.stock ? parseInt(variant.stock, 10) : 0,
              weightGrams: variant.weightGrams
                ? parseInt(variant.weightGrams, 10)
                : null,
              isDefault: variant.isDefault,
              optionValues: {
                create: optionValueIds.map((optionValueId) => ({ optionValueId })),
              },
            },
          });
        }
      }

      return created;
    });

    revalidatePath("/admin/products");
    return { ok: true, productId: product.id };
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Something went wrong saving the product." };
  }
}

type SimpleResult = { ok: true } | { ok: false; error: string };

export async function deleteProduct(id: string): Promise<SimpleResult> {
  await requireAdmin();

  // OrderItem keeps a required, non-cascading relation to Product (it's a
  // snapshot of what was ordered), so a product with order history can't
  // be hard-deleted — steer the admin toward archiving instead.
  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    return {
      ok: false,
      error: "This product has order history — archive it instead of deleting.",
    };
  }

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    console.error(err);
    return { ok: false, error: "Couldn't delete this product." };
  }

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function setProductStatus(
  id: string,
  status: "DRAFT" | "ACTIVE" | "ARCHIVED"
): Promise<SimpleResult> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/admin/products");
  return { ok: true };
}