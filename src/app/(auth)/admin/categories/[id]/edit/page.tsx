import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { flattenCategoryTree } from "@/lib/category-tree";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [category, categories] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ select: { id: true, name: true, parentId: true } }),
  ]);

  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Edit category</h1>
      <CategoryForm
        categoryId={category.id}
        initial={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          image: category.image,
          parentId: category.parentId,
        }}
        parentOptions={flattenCategoryTree(categories, category.id)}
      />
    </div>
  );
}