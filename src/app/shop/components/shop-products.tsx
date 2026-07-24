"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

type Product = {
  id: string;
  name: string;
  price: number;
  discount?: number;
  category: "Fragrance" | "Cleanser" | "Serums";
  gender?: "Male" | "Female" | "Unisex";
  brand?: string;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    id: "flumam-amber",
    name: "Flumam Amber",
    price: 4500,
    discount: 30,
    category: "Fragrance",
    gender: "Unisex",
    brand: "Lumani",
    image:
      "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW61jyPPFTDcqf6IVsjvbyeGHu0JDkPEr45idNm",
  },
  {
    id: "eco-display",
    name: "Eco Display",
    price: 8500,
    discount: 15,
    category: "Cleanser",
    gender: "Unisex",
    brand: "Lumani",
    image:
      "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6U2Mt1h6j2NdYey1T6aLDBvsglQop9KiOIGnh",
  },
  {
    id: "marble-mortar",
    name: "Marble Mortar",
    price: 4000,
    discount: 10,
    category: "Serums",
    gender: "Unisex",
    brand: "Lumani",
    image:
      "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6vRqhXOBbV1pxeTEA7adYlURkmj35ZnwGJr8P",
  },
];

const CATEGORIES: Product["category"][] = ["Fragrance", "Cleanser", "Serums"];
const BRANDS = Array.from(
  new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))
) as string[];

function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!cursorRef.current) return;
    xTo.current = gsap.quickTo(cursorRef.current, "x", {
      duration: 0.45,
      ease: "power3",
    });
    yTo.current = gsap.quickTo(cursorRef.current, "y", {
      duration: 0.45,
      ease: "power3",
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    xTo.current?.(e.clientX - rect.left);
    yTo.current?.(e.clientY - rect.top);
  };

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    gsap.set(cursorRef.current, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    gsap.to(cursorRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    gsap.to(cursorRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <div className="flex flex-col">
      <div
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        className="group relative aspect-[4/3] w-full overflow-hidden bg-neutral-200 md:cursor-none"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 30vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {product.discount && (
          <span className="absolute left-4 top-4 rounded-sm bg-white px-3 py-1 text-xs font-medium text-neutral-900">
            %{product.discount}
          </span>
        )}

        <div
          ref={cursorRef}
          className="pointer-events-none absolute left-0 top-0 z-10 hidden h-10 w-24 -translate-x-1/2 -translate-y-1/2 scale-0 items-center justify-center rounded-xs bg-black opacity-0 md:flex"
        >
          <span className="text-sm font-medium uppercase tracking-wide text-lime-400">
            Discover
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-neutral-700">
          &#8358; {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function ShopProducts() {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [categories, setCategories] = useState<Product["category"][]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const toggleCategory = (cat: Product["category"]) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (gender !== "All" && p.gender !== gender) return false;
      if (categories.length && !categories.includes(p.category)) return false;
      if (brands.length && (!p.brand || !brands.includes(p.brand)))
        return false;
      return true;
    });
  }, [search, gender, categories, brands]);

  return (
    <section className="bg-white px-6 py-16 md:px-10 md:py-20">
      <h2 className="mb-10 text-2xl font-normal uppercase tracking-wide text-neutral-400 md:text-3xl">
        Products
      </h2>

      <div className="flex flex-col gap-10 md:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-900">
            Filters
          </h3>

          {/* Search */}
          <div className="mb-8">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Search
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="mb-8">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
            >
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
              <option>Unisex</option>
            </select>
          </div>

          {/* Category */}
          <div className="mb-8">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Category
            </label>
            <div className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-sm text-neutral-800"
                >
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="h-4 w-4 accent-neutral-900"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          {BRANDS.length > 0 && (
            <div className="mb-8">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                Brand
              </label>
              <div className="flex flex-col gap-2">
                {BRANDS.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 text-sm text-neutral-800"
                  >
                    <input
                      type="checkbox"
                      checked={brands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 accent-neutral-900"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-500">
              No products match your filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}