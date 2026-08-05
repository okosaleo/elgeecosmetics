"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { calculateShippingFee, type ShippingEstimate } from "@/lib/shipping";

const addressFieldsSchema = z.object({
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
});

const inputSchema = z.union([
  z.object({ addressId: z.string().min(1) }),
  z.object({ newAddress: addressFieldsSchema }),
]);

type Result = { ok: true; estimate: ShippingEstimate } | { ok: false; error: string };

export async function estimateShippingFee(input: unknown): Promise<Result> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, error: "Please log in to check out." };
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Add a complete address first." };
  }

  let addressFields: z.infer<typeof addressFieldsSchema>;

  if ("addressId" in parsed.data) {
    const address = await prisma.address.findFirst({
      where: { id: parsed.data.addressId, userId: session.user.id },
      select: { line1: true, city: true, state: true, country: true },
    });
    if (!address) return { ok: false, error: "Address not found." };
    addressFields = address;
  } else {
    addressFields = parsed.data.newAddress;
  }

  const estimate = await calculateShippingFee(addressFields);
  return { ok: true, estimate };
}