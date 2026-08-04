import "server-only";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";

type FinalizeResult =
  | { ok: true; alreadyProcessed: boolean; orderNumber: string }
  | { ok: false; error: string };

/**
 * Verifies a transaction reference directly with Paystack (never trusts
 * client-reported success), then marks the matching Order/Payment paid and
 * decrements variant stock. Safe to call more than once for the same
 * reference - short-circuits if the payment is already SUCCEEDED.
 */
export async function finalizeOrderPayment(reference: string): Promise<FinalizeResult> {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: { include: { items: true } } },
  });

  if (!payment) {
    return { ok: false, error: `No payment found for reference ${reference}` };
  }

  if (payment.status === "SUCCEEDED") {
    return { ok: true, alreadyProcessed: true, orderNumber: payment.order.orderNumber };
  }

  const verification = await verifyPaystackTransaction(reference);

  if (!verification.status || verification.data.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        gatewayResponse: verification as unknown as object,
      },
    });
    return { ok: false, error: "Payment was not successful." };
  }

  if (verification.data.amount !== payment.amount) {
    // Amount mismatch is a red flag — don't mark it paid, don't touch stock.
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        gatewayResponse: verification as unknown as object,
      },
    });
    return { ok: false, error: "Amount mismatch — payment flagged, not confirmed." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCEEDED",
        gatewayResponse: verification as unknown as object,
      },
    });

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    });

    for (const item of payment.order.items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // Clear whichever cart these items came from, if it still exists.
    const cart = await tx.cart.findUnique({
      where: { userId: payment.order.userId },
    });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  });

  return { ok: true, alreadyProcessed: false, orderNumber: payment.order.orderNumber };
}