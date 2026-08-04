import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Top section */}
      <div className="flex md:flex-nowrap flex-wrap items-start justify-between gap-10 px-6 pt-14 pb-16 md:px-8 md:pt-16 md:pb-20">
        <p className="max-w-3xl text-2xl font-medium uppercase   text-lime-200 md:text-4xl">
          An e-commerce platform dedicated to quality goods, refined
          aesthetics, and effortless purchasing.
        </p>

        <div className="flex flex-wrap gap-10 md:gap-20">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white">
              Address
            </h4>
            <p className="text-sm text-neutral-300">
              Shop D15, Abia Plaza, Tradefair, Lagos State.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white">
              Email
            </h4>
            <a
              href="mailto:sales@elgeecosmetics.com"
              className="text-sm text-neutral-300 hover:text-lime-200 transition-colors"
            >
              elgeecosmetics@gmail.com
            </a>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white">
              Whats App
            </h4>
            <p className="text-sm text-neutral-300">+2348087642340</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-dotted border-neutral-600" />

      {/* Bottom links row */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 text-xs tracking-wide text-lime-200 md:px-10">
        <span>ELGEECOSMETICS</span>
        <span>© 2026</span>
        <div className="flex gap-10 text-white">
          <a href="/return-policy" className="hover:text-lime-200 transition-colors">
            Return Policy
          </a>
          <a href="/terms" className="hover:text-lime-200 transition-colors">
            Terms of Use
          </a>
        </div>
      </div>

      {/* Oversized wordmark banner */}
      <div className="relative flex h-[220px] items-end overflow-hidden md:h-[300px]">
        {/* Replace src with your real photo asset */}
        <Image
          src="https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6ZnntzXVlIi6mx5LJ4wZ7nyeXF31CjBQzgfdu"
          alt=""
          fill
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-black/20" />
        <h1
          className="relative select-none text-[10.2vw] whitespace-nowrap md:pl-4 pl-1 font-bold leading-[0.8] text-white"
        >
          ELGEECOSMETICS
        </h1>
      </div>
    </footer>
  );
}