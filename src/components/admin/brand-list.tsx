import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Plus } from "@hugeicons/core-free-icons";
import { DeleteButton } from "../delete-button";
import { deleteBrand } from "@/app/(auth)/admin/categories/actions";


export async function BrandList() {
  const brands = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm">
          <Link href="/admin/brands/new">
            <HugeiconsIcon icon={Plus} className="mr-1 h-3.5 w-3.5" />
            New brand
          </Link>
        </Button>
      </div>

      {brands.length === 0 ? (
        <p className="rounded-md border border-dashed border-neutral-300 px-4 py-8 text-center text-sm text-neutral-500">
          No brands yet.
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
              {brands.map((b) => (
                <tr key={b.id} className="border-t border-neutral-100">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {b.logo ? (
                        <div className="relative h-7 w-7 overflow-hidden rounded border border-neutral-200">
                          <Image src={b.logo} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded border border-dashed border-neutral-200" />
                      )}
                      <Link
                        href={`/admin/brands/${b.id}/edit`}
                        className="font-medium text-neutral-800 hover:underline"
                      >
                        {b.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-neutral-500">{b.slug}</td>
                  <td className="px-3 py-2 text-neutral-500">{b._count.products}</td>
                  <td className="px-3 py-2 text-right">
                    <DeleteButton
                      id={b.id}
                      action={deleteBrand}
                      confirmMessage={`Delete "${b.name}"? Products using it will just lose their brand tag.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}