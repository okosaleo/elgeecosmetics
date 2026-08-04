"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { finalizeOrderPayment } from "@/lib/finalize-order-payment";

const newAddressSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().optional(),
  country: z.string().min(1).default("Nigeria"),
});

const checkoutInputSchema = z.union([
  z.object({ addressId: z.string().min(1) }),
  z.object({ newAddress: newAddressSchema, setDefault: z.boolean().optional() }),
]);

type InitResult =
  | {
      ok: true;
      reference: string;
      amount: number; // kobo
      email: string;
      orderNumber: string;
    }
  | { ok: false; error: string };

export async function initializeCheckout(input: unknown): Promise<InitResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { ok: false, error: "Please log in to check out." };
  }

  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please provide a shipping address." };
  }

  // Resolve to a concrete addressId, creating + optionally defaulting a new
  // address first if that's the path the user took.
  let addressId: string;

  if ("addressId" in parsed.data) {
    const existing = await prisma.address.findFirst({
      where: { id: parsed.data.addressId, userId: session.user.id },
      select: { id: true },
    });
    if (!existing) {
      return { ok: false, error: "That address couldn't be found — pick another." };
    }
    addressId = existing.id;
  } else {
    const { newAddress, setDefault } = parsed.data;
    const existingCount = await prisma.address.count({
      where: { userId: session.user.id, type: "SHIPPING" },
    });
    const shouldBeDefault = Boolean(setDefault) || existingCount === 0;

    const created = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId: session.user.id, type: "SHIPPING" },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: {
          userId: session.user.id,
          type: "SHIPPING",
          isDefault: shouldBeDefault,
          ...newAddress,
        },
      });
    });
    addressId = created.id;
  }

  const cart = await getOrCreateCart();
  if (cart.items.length === 0) {
    return { ok: false, error: "Your bag is empty." };
  }

  // Re-derive prices and stock from the DB right now — never trust
  // whatever the cart context last had cached on the client.
  let subtotal = 0;
  const lineItems: {
    productId: string;
    variantId: string | null;
    name: string;
    sku: string | null;
    unitPrice: number;
    quantity: number;
  }[] = [];

  for (const item of cart.items) {
    if (item.variant) {
      if (item.variant.stock < item.quantity) {
        return {
          ok: false,
          error: `"${item.product.name}" only has ${item.variant.stock} left in stock.`,
        };
      }
      lineItems.push({
        productId: item.productId,
        variantId: item.variantId,
        name: item.product.name,
        sku: item.variant.sku,
        unitPrice: item.variant.price,
        quantity: item.quantity,
      });
      subtotal += item.variant.price * item.quantity;
    } else {
      lineItems.push({
        productId: item.productId,
        variantId: null,
        name: item.product.name,
        sku: null,
        unitPrice: item.product.basePrice,
        quantity: item.quantity,
      });
      subtotal += item.product.basePrice * item.quantity;
    }
  }

  const shippingFee = 0; // wire up real shipping calculation later if needed
  const total = subtotal + shippingFee;

  const orderNumber = `ELG-${Date.now().toString(36).toUpperCase()}`;
  const reference = `pay_${orderNumber}_${Math.random().toString(36).slice(2, 8)}`;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        addressId,
        subtotal,
        shippingFee,
        total,
        items: { create: lineItems },
      },
    });

    await tx.payment.create({
      data: {
        orderId: order.id,
        method: "PAYSTACK",
        amount: total,
        reference,
      },
    });
  });

  return {
    ok: true,
    reference,
    amount: total,
    email: session.user.email,
    orderNumber,
  };
}

export async function verifyPaystackPayment(reference: string) {
  return finalizeOrderPayment(reference);
}