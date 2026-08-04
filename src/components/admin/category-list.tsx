import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus } from "@hugeicons/core-free-icons";
import { deleteCategory } from "@/app/(auth)/admin/categories/actions";
import { flattenCategoryTree } from "@/lib/category-tree";
import { DeleteButton } from "../delete-button";

export async function CategoryList() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true, children: true } } },
  });

  const flat = flattenCategoryTree(categories);
  const byId = new Map(categories.map((c) => [c.id, c]));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm">
          <Link href="/admin/categories/new">
            <HugeiconsIcon icon={Plus} className="mr-1 h-3.5 w-3.5" />
            New category
          </Link>
        </Button>
      </div>

      {flat.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
          No categories yet. Create one to start organizing products.
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Products</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {flat.map(({ id, depth }) => {
                const c = byId.get(id)!;
                return (
                  <tr key={id} className="border-t border-neutral-100">
                    <td className="px-3 py-2">
                      <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: depth * 16 }}
                      >
                        {c.image ? (
                          <div className="relative h-7 w-7 overflow-hidden rounded border border-neutral-200">
                            <Image src={c.image} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded border border-dashed border-neutral-200" />
                        )}
                        <Link
                          href={`/admin/categories/${id}/edit`}
                          className="font-medium text-neutral-800 hover:underline"
                        >
                          {c.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-neutral-500">{c.slug}</td>
                    <td className="px-3 py-2 text-neutral-500">
                      {c._count.products}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <DeleteButton
                        id={id}
                        action={deleteCategory}
                        confirmMessage={`Delete "${c.name}"? This can't be undone.`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}