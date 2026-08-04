import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { finalizeOrderPayment } from "@/lib/finalize-order-payment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    if (reference) {
      const result = await finalizeOrderPayment(reference);
      if (!result.ok) {
        console.error("Paystack webhook finalize failed:", result.error);
      }
    }
  }

  // Always 200 an acknowledged webhook, even for events we don't act on,
  // so Paystack doesn't keep retrying.
  return NextResponse.json({ received: true });
}