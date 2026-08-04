import Link from "next/link";

export default function AuthNav() {
  return (
    <header className="absolute top-0 left-0 z-20 flex w-full items-center justify-between px-6 py-6 md:px-10">
      <Link
        href="/"
        className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-100"
      >
        Elgeecosmetics
      </Link>
      <Link
        href="/shop"
        className="text-xs uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:text-lime-300"
      >
        Back to shop
      </Link>
    </header>
  );
}