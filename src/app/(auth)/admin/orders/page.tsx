import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { koboToNaira } from "@/lib/slugify";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { OrderStatusSelect } from "./components/order-status-select";

const PAGE_SIZE = 25;

const paymentStyles: Record<PaymentStatus, string> = {
  PENDING: "text-neutral-400",
  SUCCEEDED: "text-green-600",
  FAILED: "text-red-600",
  REFUNDED: "text-amber-600",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q = "", status = "ALL", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const where = {
    ...(status !== "ALL" ? { status: status as OrderStatus } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (status !== "ALL") usp.set("status", status);
    usp.set("page", String(targetPage));
    return `/admin/orders?${usp.toString()}`;
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Orders</h1>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/orders">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search order # or customer…"
          className="h-9 w-64 rounded-md border border-neutral-300 px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-neutral-300 px-2 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50"
        >
          Filter
        </button>
        {(q || status !== "ALL") && (
          <a
            href="/admin/orders"
            className="flex h-9 items-center px-3 text-sm text-neutral-500 hover:underline"
          >
            Clear
          </a>
        )}
      </form>

      {orders.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
          No orders match those filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Payment</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-neutral-100">
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-medium text-neutral-800 hover:underline"
                    >
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-neutral-800">{o.user.name}</p>
                    <p className="text-xs text-neutral-400">{o.user.email}</p>
                  </td>
                  <td className="px-3 py-2 text-neutral-500">{o.items.length}</td>
                  <td className="px-3 py-2 text-neutral-700">
                    ₦{koboToNaira(o.total)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-medium ${
                        o.payment ? paymentStyles[o.payment.status] : "text-neutral-400"
                      }`}
                    >
                      {o.payment?.status ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <OrderStatusSelect orderId={o.id} status={o.status} />
                  </td>
                  <td className="px-3 py-2 text-neutral-400">
                    {o.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>
            Page {page} of {totalPages} · {total} order{total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-md border border-neutral-300 px-3 py-1.5 hover:bg-neutral-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}