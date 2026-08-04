import "server-only";
import crypto from "crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // kobo
    currency: string;
    paid_at: string | null;
    gateway_response: string;
    customer: { email: string };
  };
};

/** Calls Paystack's verify-transaction endpoint. Always trust this over
 *  anything reported by the client — the client can lie, Paystack can't. */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Paystack verify request failed: ${res.status}`);
  }

  return res.json();
}

/** Paystack signs webhook bodies with HMAC-SHA512 of the raw JSON body,
 *  using your secret key. Must be checked against the RAW body string —
 *  do not JSON.parse and re-stringify before hashing, ordering/whitespace
 *  differences will break the comparison. */
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
}