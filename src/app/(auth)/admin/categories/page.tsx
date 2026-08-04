import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { CategoryList } from "@/components/admin/category-list";
import { BrandList } from "@/components/admin/brand-list";

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Categories & brands</h1>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="pt-4">
          <CategoryList />
        </TabsContent>
        <TabsContent value="brands" className="pt-4">
          <BrandList />
        </TabsContent>
      </Tabs>
    </div>
  );
}