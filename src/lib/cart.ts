import "server-only";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import { prisma } from "./prisma";
import { auth } from "./auth";
import { koboToNaira } from "./slugify";

const CART_COOKIE = "guest_cart_token";

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          images: { orderBy: { position: "asc" as const }, take: 1 },
        },
      },
      variant: {
        include: {
          optionValues: {
            include: { optionValue: { include: { option: true } } },
          },
        },
      },
    },
  },
} satisfies import("@/generated/prisma").Prisma.CartInclude;

export type CartWithItems = NonNullable<
  Awaited<ReturnType<typeof getOrCreateCart>>
>;

/**
 * Returns the current cart, creating one if needed.
 * - Logged in: keyed by userId. If they also have a guest cart cookie,
 *   that guest cart is merged in (item quantities summed) and adopted.
 * - Guest: keyed by an httpOnly cookie token.
 */
export async function getOrCreateCart() {
  const session = await auth.api.getSession({ headers: await headers() });
  const cookieStore = await cookies();

  if (session?.user) {
    const existing = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: cartInclude,
    });

    const guestToken = cookieStore.get(CART_COOKIE)?.value;
    const guestCart = guestToken
      ? await prisma.cart.findUnique({
          where: { sessionToken: guestToken },
          include: cartInclude,
        })
      : null;

    if (guestCart && existing) {
      // Merge guest items into the existing account cart, then drop the guest cart.
      for (const item of guestCart.items) {
        const match = existing.items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );
        if (match) {
          await prisma.cartItem.update({
            where: { id: match.id },
            data: { quantity: match.quantity + item.quantity },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              cartId: existing.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          });
        }
      }
      await prisma.cart.delete({ where: { id: guestCart.id } });
      cookieStore.delete(CART_COOKIE);
      return prisma.cart.findUniqueOrThrow({
        where: { id: existing.id },
        include: cartInclude,
      });
    }

    if (guestCart && !existing) {
      const adopted = await prisma.cart.update({
        where: { id: guestCart.id },
        data: { userId: session.user.id, sessionToken: null },
        include: cartInclude,
      });
      cookieStore.delete(CART_COOKIE);
      return adopted;
    }

    if (existing) return existing;

    return prisma.cart.create({
      data: { userId: session.user.id },
      include: cartInclude,
    });
  }

  // Guest flow
  let token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) {
    token = randomUUID();
    cookieStore.set(CART_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  const existing = await prisma.cart.findUnique({
    where: { sessionToken: token },
    include: cartInclude,
  });
  if (existing) return existing;

  return prisma.cart.create({
    data: { sessionToken: token },
    include: cartInclude,
  });
}

export type CartItemSummary = {
  id: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  variantLabel: string | null;
  unitPrice: number; // kobo
  unitPriceFormatted: string; // "₦4,500.00"
  quantity: number;
  stock: number | null; // null = untracked (simple product)
  lineTotal: number; // kobo
};

export type CartSummary = {
  items: CartItemSummary[];
  count: number;
  subtotal: number; // kobo
  subtotalFormatted: string;
};

export function toCartSummary(cart: CartWithItems): CartSummary {
  const items: CartItemSummary[] = cart.items.map((item) => {
    const unitPrice = item.variant?.price ?? item.product.basePrice;
    const variantLabel = item.variant
      ? item.variant.optionValues
          .map((ov) => ov.optionValue.value)
          .join(" / ")
      : null;

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.images[0]?.url ?? null,
      variantLabel,
      unitPrice,
      unitPriceFormatted: `₦${koboToNaira(unitPrice)}`,
      quantity: item.quantity,
      stock: item.variant?.stock ?? null,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    count,
    subtotal,
    subtotalFormatted: `₦${koboToNaira(subtotal)}`,
  };
}