import { prisma } from "@/lib/prisma";
import { ProductForm } from "./components/product-form";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">New product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}