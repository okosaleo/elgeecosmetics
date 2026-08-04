"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const reviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.number().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

type ActionResult = { ok: true } | { ok: false; error: string };

export async function createReview(input: unknown): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, error: "Please log in to leave a review." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please add a star rating before submitting." };
  }
  const data = parsed.data;

  const existing = await prisma.review.findFirst({
    where: { productId: data.productId, userId: session.user.id },
  });

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating: data.rating,
        title: data.title || null,
        body: data.body || null,
        approved: false, // edits go back through moderation
      },
    });
  } else {
    await prisma.review.create({
      data: {
        productId: data.productId,
        userId: session.user.id,
        rating: data.rating,
        title: data.title || null,
        body: data.body || null,
      },
    });
  }

  revalidatePath(`/shop/${data.productSlug}`);
  return { ok: true };
}