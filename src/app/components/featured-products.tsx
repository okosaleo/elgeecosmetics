import { prisma } from "@/lib/prisma";
import { FeaturedProductCard } from "./featured-product-card";


export default async function FeaturedProducts() {
  const products = await prisma.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { price: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  if (products.length === 0) return null;

  const featured: FeaturedProduct[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    price: p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : p.basePrice,
    compareAtPrice: p.variants.length > 0 ? null : p.compareAtPrice,
    image: p.images[0]?.url ?? null,
  }));

  return (
    <section className="bg-white px-6 py-16 md:px-10 md:py-20">
      <h2 className="mb-10 text-2xl font-normal uppercase tracking-wide text-neutral-800 md:text-3xl">
        Featured Products
      </h2>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
        {featured.map((product) => (
          <FeaturedProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}