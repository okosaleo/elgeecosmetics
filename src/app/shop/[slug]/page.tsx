import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import SimpleNav from "@/app/components/SimpleNav";
import type { OptionView, VariantView } from "@/lib/variant-utils";
import { ProductGallery } from "../components/product-gallery";
import { ProductBuyBox } from "../components/product-buy-box";
import { ProductReviews } from "../components/product-reviews";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" } },
        options: {
          orderBy: { position: "asc" },
          include: { values: { orderBy: { position: "asc" } } },
        },
        variants: {
          include: {
            optionValues: {
              include: { optionValue: { include: { option: true } } },
            },
          },
        },
        reviews: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true } } },
        },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!product || product.status !== "ACTIVE") notFound();

  const options: OptionView[] = product.options.map((o) => ({
    name: o.name,
    values: o.values.map((v) => v.value),
  }));

  const variants: VariantView[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    stock: v.stock,
    isDefault: v.isDefault,
    options: Object.fromEntries(
      v.optionValues.map((ov) => [ov.optionValue.option.name, ov.optionValue.value])
    ),
  }));

  return (
    <div>
      <SimpleNav title="ELGEECOSMETICS" />

      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <ProductGallery
            images={product.images.map((img) => ({ url: img.url, alt: img.alt }))}
          />
        </div>

        <div className="md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <div className="flex h-full flex-col justify-center px-6 py-16 md:px-12">
            <ProductBuyBox
              productId={product.id}
              name={product.name}
              description={product.description}
              categoryName={product.category.name}
              featured={product.featured}
              basePrice={product.basePrice}
              compareAtPrice={product.compareAtPrice}
              sku={product.sku}
              options={options}
              variants={variants}
            />
          </div>
        </div>
      </div>

      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        isLoggedIn={Boolean(session?.user)}
        reviews={product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          createdAt: r.createdAt.toISOString(),
          userName: r.user.name,
        }))}
      />
    </div>
  );
}