"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import { initializeCheckout, verifyPaystackPayment } from "./actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

export type SavedAddress = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

type NewAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const emptyAddress: NewAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nigeria",
};

type PayConfig = {
  reference: string;
  email: string;
  amount: number;
  publicKey: string;
};

export function CheckoutForm({
  email,
  savedAddresses,
}: {
  email: string;
  savedAddresses: SavedAddress[];
}) {
  const router = useRouter();

  const defaultSaved = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [mode, setMode] = useState<"saved" | "new">(
    savedAddresses.length > 0 ? "saved" : "new"
  );
  const [selectedId, setSelectedId] = useState<string | null>(defaultSaved?.id ?? null);
  const [newAddress, setNewAddress] = useState<NewAddress>(emptyAddress);
  const [setAsDefault, setSetAsDefault] = useState(savedAddresses.length === 0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payConfig, setPayConfig] = useState<PayConfig | null>(null);

  const initializePayment = usePaystackPayment(
    payConfig ?? { reference: "", email, amount: 0, publicKey: PUBLIC_KEY }
  );

  useEffect(() => {
    if (!payConfig) return;

    initializePayment({
      onSuccess: async (transaction: { reference: string }) => {
        const result = await verifyPaystackPayment(transaction.reference);
        if (result.ok) {
          router.push(`/order/${result.orderNumber}/confirmation`);
        } else {
          setError(
            "Payment went through but we couldn't confirm it automatically — it'll finalize shortly, or reach out to support and reference this order."
          );
        }
      },
      onClose: () => {
        setError("Payment cancelled — you can try again whenever you're ready.");
        setPayConfig(null);
      },
    });

    setPayConfig(null); // reset so this effect doesn't re-fire on its own
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payConfig]);

  function setField<K extends keyof NewAddress>(key: K, value: NewAddress[K]) {
    setNewAddress((a) => ({ ...a, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!PUBLIC_KEY) {
      setError("Payments aren't configured yet (missing Paystack public key).");
      return;
    }

    if (mode === "saved" && !selectedId) {
      setError("Pick a shipping address, or add a new one.");
      return;
    }

    setSubmitting(true);
    const result = await initializeCheckout(
      mode === "saved"
        ? { addressId: selectedId! }
        : { newAddress, setDefault: setAsDefault }
    );
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPayConfig({
      reference: result.reference,
      email: result.email,
      amount: result.amount,
      publicKey: PUBLIC_KEY,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        Shipping details
      </h2>

      {mode === "saved" && (
        <div className="flex flex-col gap-3">
          {savedAddresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex cursor-pointer items-start gap-3 border px-4 py-3 text-sm transition ${
                selectedId === addr.id
                  ? "border-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <input
                type="radio"
                name="savedAddress"
                checked={selectedId === addr.id}
                onChange={() => setSelectedId(addr.id)}
                className="mt-1 accent-neutral-900"
              />
              <div>
                <p className="font-medium text-neutral-900">
                  {addr.fullName}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs font-normal uppercase tracking-wide text-neutral-400">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-neutral-500">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state}
                  {addr.postalCode ? ` ${addr.postalCode}` : ""}, {addr.country}
                </p>
                <p className="text-neutral-400">{addr.phone}</p>
              </div>
            </label>
          ))}

          <button
            type="button"
            onClick={() => setMode("new")}
            className="w-fit text-sm font-medium underline underline-offset-4"
          >
            + Use a different address
          </button>
        </div>
      )}

      {mode === "new" && (
        <div className="flex flex-col gap-4">
          {savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={() => setMode("saved")}
              className="w-fit text-sm font-medium underline underline-offset-4"
            >
              ‹ Back to saved addresses
            </button>
          )}

          <input
            required
            placeholder="Full name"
            value={newAddress.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <input
            required
            placeholder="Phone number"
            value={newAddress.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <input
            required
            placeholder="Address line 1"
            value={newAddress.line1}
            onChange={(e) => setField("line1", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <input
            placeholder="Address line 2 (optional)"
            value={newAddress.line2}
            onChange={(e) => setField("line2", e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setField("city", e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <input
              required
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setField("state", e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Postal code (optional)"
              value={newAddress.postalCode}
              onChange={(e) => setField("postalCode", e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <input
              required
              placeholder="Country"
              value={newAddress.country}
              onChange={(e) => setField("country", e.target.value)}
              className="border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
          </div>

          {savedAddresses.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="h-4 w-4 accent-neutral-900"
              />
              Set as default address
            </label>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 bg-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {submitting ? "Preparing payment…" : "Pay with Paystack"}
      </button>
    </form>
  );
}