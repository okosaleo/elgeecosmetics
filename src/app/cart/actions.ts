"use server";

import { prisma } from "@/lib/prisma";
import { getOrCreateCart, toCartSummary, type CartSummary } from "@/lib/cart";

type ActionResult =
  | { ok: true; summary: CartSummary }
  | { ok: false; error: string };

export async function addToCart(
  productId: string,
  variantId: string | null,
  quantity: number = 1
): Promise<ActionResult> {
  if (quantity < 1) return { ok: false, error: "Invalid quantity." };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: variantId ? { where: { id: variantId } } : false },
  });
  if (!product || product.status !== "ACTIVE") {
    return { ok: false, error: "This product isn't available." };
  }

  const variant = variantId ? product.variants?.[0] : null;
  if (variantId && !variant) {
    return { ok: false, error: "That option isn't available." };
  }

  const cart = await getOrCreateCart();
  const existing = cart.items.find(
    (i) => i.productId === productId && i.variantId === (variantId ?? null)
  );
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  if (variant && variant.stock < nextQuantity) {
    return {
      ok: false,
      error:
        variant.stock === 0
          ? "That option is out of stock."
          : `Only ${variant.stock} left in stock.`,
    };
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId, quantity },
    });
  }

  const updated = await getOrCreateCart();
  return { ok: true, summary: toCartSummary(updated) };
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<ActionResult> {
  const cart = await getOrCreateCart();
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return { ok: false, error: "Item not found in your cart." };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
  } else {
    if (item.variant && item.variant.stock < quantity) {
      return { ok: false, error: `Only ${item.variant.stock} left in stock.` };
    }
    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }

  const updated = await getOrCreateCart();
  return { ok: true, summary: toCartSummary(updated) };
}

export async function removeCartItem(itemId: string): Promise<ActionResult> {
  return updateCartItemQuantity(itemId, 0);
}

export async function getCartSummary(): Promise<CartSummary> {
  const cart = await getOrCreateCart();
  return toCartSummary(cart);
}