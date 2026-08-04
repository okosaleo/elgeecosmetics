import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import SimpleNav from "@/app/components/SimpleNav";
import { koboToNaira } from "@/lib/slugify";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await requireUser();
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, address: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div>
      <SimpleNav title="ELGEECOSMETICS" showCart={false} />

      <div className="mx-auto max-w-2xl px-6 py-24 text-center md:px-10">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          Order {order.orderNumber}
        </p>
        <h1 className="mt-3 text-3xl font-normal uppercase tracking-wide text-neutral-900">
          {order.status === "PAID" ? "Thank you!" : "Order received"}
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          {order.status === "PAID"
            ? "Your payment went through and your order is confirmed."
            : "We're still confirming your payment — this'll update shortly."}
        </p>

        <div className="mt-10 rounded-md border border-neutral-200 p-6 text-left">
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₦{koboToNaira(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4 text-sm font-semibold">
            <span>Total</span>
            <span>₦{koboToNaira(order.total)}</span>
          </div>
        </div>

        {order.address && (
          <p className="mt-6 text-sm text-neutral-500">
            Shipping to {order.address.fullName}, {order.address.line1},{" "}
            {order.address.city}, {order.address.state}
          </p>
        )}

        <Link
          href="/shop"
          className="mt-10 inline-block bg-neutral-900 px-6 py-3 text-sm font-medium uppercase tracking-wide text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}