"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

type Product = {
  name: string;
  price: number;
  discount?: number;
  image: string;
};

const PRODUCTS: Product[] = [
  {
    name: "Flumam Amber",
    price: 4500,
    discount: 30,
    image: "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW61jyPPFTDcqf6IVsjvbyeGHu0JDkPEr45idNm",
  },
  {
    name: "Black Pump",
    price: 8500,
    image: "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6U2Mt1h6j2NdYey1T6aLDBvsglQop9KiOIGnh",
  },
  {
    name: "Serene Aesthetic",
    price: 4000,
    discount: 20,
    image: "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6vRqhXOBbV1pxeTEA7adYlURkmj35ZnwGJr8P",
  },
];

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    xTo.current?.(x);
    yTo.current?.(y);
  };

  const handleEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    // snap to entry position first so it doesn't fly in from a stale spot
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
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {product.discount && (
          <span className="absolute left-4 top-4 rounded-sm bg-white px-3 py-1 text-xs font-medium text-neutral-900">
            %{product.discount}
          </span>
        )}

        {/* custom cursor-follow button, hidden until hover */}
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
        <p className="mt-1 text-sm text-neutral-700 font-medium">&#8358; {product.price}</p>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="bg-white px-6 py-16 md:px-10 md:py-20">
      <h2 className="mb-10 text-2xl font-normal uppercase tracking-wide text-neutral-800 md:text-3xl">
        Featured Products
      </h2>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.name} product={product} />
        ))}
      </div>
    </section>
  );
}