"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";

export type FeaturedProduct = {
  slug: string;
  name: string;
  price: number; // kobo
  compareAtPrice: number | null; // kobo
  image: string | null;
};

function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function FeaturedProductCard({ product }: { product: FeaturedProduct }) {
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

  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <Link href={`/shop/${product.slug}`} className="flex flex-col">
      <div
        ref={cardRef}
        onMouseEnter={handleEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        className="group relative aspect-[4/3] w-full overflow-hidden bg-neutral-200 md:cursor-none"
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}

        {discount && (
          <span className="absolute left-4 top-4 rounded-sm bg-white px-3 py-1 text-xs font-medium text-neutral-900">
            %{discount}
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
          &#8358; {Math.round(product.price / 100).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}