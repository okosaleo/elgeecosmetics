import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { koboToNaira } from "@/lib/slugify";
import { OrderStatusSelect } from "../components/order-status-select";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      payment: true,
      items: {
        include: {
          product: { select: { slug: true, images: { take: 1, orderBy: { position: "asc" } } } },
        },
      },
      coupon: { select: { code: true } },
    },
  });

  if (!order) notFound();

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-400 hover:underline"
          >
            ← All orders
          </Link>
          <h1 className="mt-1 text-xl font-semibold">{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">
            Placed {order.createdAt.toLocaleString()}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.4fr_1fr]">
        {/* Items */}
        <div className="rounded-md border border-neutral-200">
          <div className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700">
            Items
          </div>
          <ul className="divide-y divide-neutral-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-50">
                  {item.product.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/admin/products`}
                    className="text-sm font-medium text-neutral-800 hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.sku && <p className="text-xs text-neutral-400">SKU: {item.sku}</p>}
                  <p className="text-xs text-neutral-400">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  ₦{koboToNaira(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 border-t border-neutral-200 px-4 py-3 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>₦{koboToNaira(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-neutral-500">
                <span>Discount{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                <span>-₦{koboToNaira(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Shipping</span>
              <span>₦{koboToNaira(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold text-neutral-800">
              <span>Total</span>
              <span>₦{koboToNaira(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Customer + shipping + payment */}
        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-neutral-200 p-4">
            <h2 className="mb-2 text-sm font-medium text-neutral-700">Customer</h2>
            <p className="text-sm text-neutral-800">{order.user.name}</p>
            <p className="text-sm text-neutral-500">{order.user.email}</p>
          </div>

          {order.address && (
            <div className="rounded-md border border-neutral-200 p-4">
              <h2 className="mb-2 text-sm font-medium text-neutral-700">
                Shipping address
              </h2>
              <p className="text-sm text-neutral-800">{order.address.fullName}</p>
              <p className="text-sm text-neutral-500">{order.address.phone}</p>
              <p className="text-sm text-neutral-500">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
              </p>
              <p className="text-sm text-neutral-500">
                {order.address.city}, {order.address.state}
                {order.address.postalCode ? ` ${order.address.postalCode}` : ""}
              </p>
              <p className="text-sm text-neutral-500">{order.address.country}</p>
            </div>
          )}

          <div className="rounded-md border border-neutral-200 p-4">
            <h2 className="mb-2 text-sm font-medium text-neutral-700">Payment</h2>
            {order.payment ? (
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Method</span>
                  <span className="text-neutral-800">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status</span>
                  <span className="text-neutral-800">{order.payment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Reference</span>
                  <span className="break-all text-right text-neutral-800">
                    {order.payment.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Amount</span>
                  <span className="text-neutral-800">
                    ₦{koboToNaira(order.payment.amount)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No payment record.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}