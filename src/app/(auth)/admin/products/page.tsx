import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "./actions";
import { koboToNaira } from "@/lib/slugify";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageOff, Plus } from "@hugeicons/core-free-icons";
import { ProductStatusSelect } from "@/components/admin/products-status-select";
import { DeleteButton } from "@/components/delete-button";

const PAGE_SIZE = 20;

function formatPrice(basePrice: number, variantPrices: number[]) {
  if (variantPrices.length === 0) return `₦${koboToNaira(basePrice)}`;
  const min = Math.min(...variantPrices);
  const max = Math.max(...variantPrices);
  return min === max
    ? `₦${koboToNaira(min)}`
    : `₦${koboToNaira(min)} – ₦${koboToNaira(max)}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q = "", status = "ALL", page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const where = {
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    ...(status !== "ALL"
      ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { select: { price: true, stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(targetPage: number) {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (status !== "ALL") usp.set("status", status);
    usp.set("page", String(targetPage));
    return `/admin/products?${usp.toString()}`;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Button size="sm">
          <Link href="/admin/products/new">
            <HugeiconsIcon icon={Plus} className="mr-1 h-3.5 w-3.5" />
            New product
          </Link>
        </Button>
      </div>

      {/* Filters — plain GET form, no JS required */}
      <form className="mb-4 flex flex-wrap gap-2" action="/admin/products">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="h-9 w-56 rounded-md border border-neutral-300 px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-9 rounded-md border border-neutral-300 px-2 text-sm"
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <Button type="submit" variant="outline" size="sm" className="h-9">
          Filter
        </Button>
        {(q || status !== "ALL") && (
          <Button variant="ghost" size="sm" className="h-9">
            <Link href="/admin/products">Clear</Link>
          </Button>
        )}
      </form>

      {products.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
          {q || status !== "ALL"
            ? "No products match those filters."
            : "No products yet. Create your first one."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stock =
                  p.variants.length > 0
                    ? p.variants.reduce((sum, v) => sum + v.stock, 0)
                    : null;

                return (
                  <tr key={p.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-50">
                          {p.images[0] ? (
                            <Image
                              src={p.images[0].url}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <HugeiconsIcon icon={ImageOff} className="m-auto h-4 w-4 translate-y-3 text-neutral-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">{p.name}</p>
                          {p.brand && (
                            <p className="text-xs text-neutral-400">{p.brand.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">{p.category.name}</td>
                    <td className="px-3 py-2 text-neutral-700">
                      {formatPrice(
                        p.basePrice,
                        p.variants.map((v) => v.price)
                      )}
                    </td>
                    <td className="px-3 py-2 text-neutral-500">
                      {stock === null ? "—" : stock}
                    </td>
                    <td className="px-3 py-2">
                      <ProductStatusSelect productId={p.id} status={p.status} />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <DeleteButton
                        id={p.id}
                        action={deleteProduct}
                        confirmMessage={`Delete "${p.name}"? This can't be undone.`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <span>
            Page {page} of {totalPages} · {total} product{total === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            {page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            ) : (
              <Button  variant="outline" size="sm">
                <Link href={pageHref(page - 1)}>Previous</Link>
              </Button>
            )}
            {page >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            ) : (
              <Button  variant="outline" size="sm">
                <Link href={pageHref(page + 1)}>Next</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}