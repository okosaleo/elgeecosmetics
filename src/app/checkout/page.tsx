import { requireUser } from "@/lib/require-user";
import { getCart, getOrCreateCart, toCartSummary } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SimpleNav from "@/app/components/SimpleNav";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const session = await requireUser("/checkout");
  const [cart, savedAddresses] = await Promise.all([
    getCart(),
    prisma.address.findMany({
      where: { userId: session.user.id, type: "SHIPPING" },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        fullName: true,
        phone: true,
        line1: true,
        line2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isDefault: true,
      },
    }),
  ]);
  const summary = toCartSummary(cart);

  if (summary.items.length === 0) {
    redirect("/shop");
  }

  return (
    <div>
      <SimpleNav title="ELGEECOSMETICS" showCart={false} />

      <div className="mx-auto max-w-4xl px-6 py-24 md:px-10">
        <h1 className="mb-10 text-2xl font-normal uppercase tracking-wide text-neutral-900">
          Checkout
        </h1>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_1fr]">
          <CheckoutForm email={session.user.email} savedAddresses={savedAddresses} />

          <div className="border-t border-neutral-200 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Order summary
            </h2>
            <ul className="flex flex-col gap-4">
              {summary.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium text-neutral-800">{item.name}</p>
                    {item.variantLabel && (
                      <p className="text-neutral-500">{item.variantLabel}</p>
                    )}
                    <p className="text-neutral-400">Qty {item.quantity}</p>
                  </div>
                  <span className="font-medium">
                    ₦{(item.lineTotal / 100).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-between border-t border-neutral-200 pt-4 text-sm font-semibold">
              <span>Total</span>
              <span>{summary.subtotalFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}