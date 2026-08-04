import { prisma } from "@/lib/prisma";
import DiscountButton from "../components/discount-button";
import HeroDistortion from "../components/HeroDistortion";
import SimpleNav from "../components/SimpleNav";
import ShopProducts, { type ShopProduct } from "./components/shop-products";

export default async function Shop() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const shopProducts: ShopProduct[] = products.map((p) => {
    const price =
      p.variants.length > 0
        ? Math.min(...p.variants.map((v) => v.price))
        : p.basePrice;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price,
      compareAtPrice: p.variants.length > 0 ? null : p.compareAtPrice,
      categoryId: p.category.id,
      categoryName: p.category.name,
      brandId: p.brand?.id ?? null,
      brandName: p.brand?.name ?? null,
      image: p.images[0]?.url ?? null,
    };
  });

  // Only show filter options that actually have active products against them
  const categories = Array.from(
    new Map(
      shopProducts.map((p) => [p.categoryId, { id: p.categoryId, name: p.categoryName }])
    ).values()
  );
  const brands = Array.from(
    new Map(
      shopProducts
        .filter((p) => p.brandId)
        .map((p) => [p.brandId as string, { id: p.brandId as string, name: p.brandName! }])
    ).values()
  );

  return (
    <div>
      <SimpleNav title="ELGEECOSMETICS" />

      <section className="relative h-screen w-full overflow-hidden">
        <DiscountButton />
        <HeroDistortion
          className="absolute inset-0"
          parallax={false}
          rippleStrength={0.35}
          rippleFrequency={10}
          rippleSpeed={5}
          rippleLife={0.4}
          rippleFalloff={3.5}
          rippleSpacing={0.12}
          mobileZoom={1.18}
          src="https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6PqIFGceYJBUGEIyvhiKdXcm7gopOCQ6fa2tq"
        />
        <div className="absolute inset-0 bg-black/20 z-[1] pointer-events-none" />
        <div className="z-10 flex relative h-screen flex-col px-4 sm:px-18 py-20 items-center justify-center text-center text-white pointer-events-none">
          <div className="absolute inset-0 lg:mt-14 mt-60 flex items-center justify-center h-screen flex-col w-full px-4 ">
            <div className="flex items-center font-medium justify-between w-full mb-4 text-xs sm:text-base">
              <p>E-COMMERCE</p>
              <p>COSMETICS</p>
              <p>LIGHTS</p>
            </div>
            <hr className="w-full border-dotted text-white" />
          </div>
          <h1 className="absolute bottom-5 sm:bottom-18 lg:bottom-7 font-normal text-[10vw] lg:text-[10.5vw] tracking-wide text-center whitespace-nowrap">
            SHOP ALL
          </h1>
        </div>
      </section>

      <ShopProducts products={shopProducts} categories={categories} brands={brands} />
    </div>
  );
}