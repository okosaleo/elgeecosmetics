"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function setReviewApproval(
  id: string,
  approved: boolean
): Promise<ActionResult> {
  await requireAdmin();
  const review = await prisma.review.update({
    where: { id },
    data: { approved },
    select: { product: { select: { slug: true } } },
  });
  revalidatePath("/admin/reviews");
  revalidatePath(`/shop/${review.product.slug}`);
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin();
  const review = await prisma.review.findUnique({
    where: { id },
    select: { product: { select: { slug: true } } },
  });
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  if (review) revalidatePath(`/shop/${review.product.slug}`);
  return { ok: true };
}