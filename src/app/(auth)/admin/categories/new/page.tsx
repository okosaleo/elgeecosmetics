import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { flattenCategoryTree } from "@/lib/category-tree";

export default async function NewCategoryPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, parentId: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">New category</h1>
      <CategoryForm parentOptions={flattenCategoryTree(categories)} />
    </div>
  );
}