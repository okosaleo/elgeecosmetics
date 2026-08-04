import type { Metadata } from "next";
import Link from "next/link";
import DiscountButton from "../components/discount-button";
import HeroDistortion from "../components/HeroDistortion";
import SimpleNav from "../components/SimpleNav";
import { SITE_NAME } from "@/lib/seo";
import { ScrollRevealText } from "./components/scroll-reveal-text";
import { FadeUpSection } from "./components/fade-up-section";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind ElgeeCosmetics — beauty lighting, tripods, and cosmetics built for people who create.",
};

const VALUES = [
  {
    title: "Made for creators",
    body: "Every light and rig we sell gets tested the way you'll actually use it — on a desk, in a bag, on a shoot that starts in ten minutes.",
  },
  {
    title: "No filler in the catalog",
    body: "If it doesn't hold up after the first week of real use, it doesn't stay in the shop. We'd rather sell fewer things well.",
  },
  {
    title: "Built around Nigeria",
    body: "Priced in Naira, stocked with delivery and daily use here in mind — not an afterthought bolted onto a foreign catalog.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <SimpleNav title="ELGEECOSMETICS" />

      {/* HERO — same pattern as Shop All / homepage */}
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
              <p>OUR STORY</p>
              <p>OUR CRAFT</p>
              <p>OUR MISSION</p>
            </div>
            <hr className="w-full border-dotted text-white" />
          </div>
          <h1 className="absolute bottom-5 sm:bottom-18 lg:bottom-7 font-normal text-[10vw] lg:text-[10.5vw] tracking-wide text-center whitespace-nowrap">
            ABOUT US
          </h1>
        </div>
      </section>

      {/* MANIFESTO — scroll-scrubbed word reveal */}
      <section className="bg-white px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-4xl">
          <ScrollRevealText
            as="h2"
            text={`${SITE_NAME} started with a simple annoyance: beauty and content tools that look good in a product photo and fall apart in real use. So we started building the shop we wished existed — lighting that holds a charge, tripods that don't wobble mid-shoot, and cosmetics worth reordering.`}
            className="text-2xl font-normal leading-snug tracking-wide text-neutral-900 md:text-4xl md:leading-tight"
          />
        </div>
      </section>

      {/* VALUES — staggered fade-up cards */}
      <section className="bg-neutral-50 px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-5xl">
          <FadeUpSection>
            <h3 className="mb-12 text-xs font-medium uppercase tracking-widest text-neutral-400">
              What we care about
            </h3>
          </FadeUpSection>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {VALUES.map((v, i) => (
              <FadeUpSection key={v.title} delay={i * 0.12}>
                <div className="border-t border-neutral-300 pt-5">
                  <h4 className="mb-2 text-lg font-medium text-neutral-900">
                    {v.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-neutral-600">{v.body}</p>
                </div>
              </FadeUpSection>
            ))}
          </div>
        </div>
      </section>

      {/* STORY SPLIT — image + scroll-scrubbed text */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <FadeUpSection y={0} className="relative aspect-[4/5] md:aspect-auto">
          <img
            src="https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6hadZ3RFOj79AxJuTmzgXeY25HURKGBZqyDrV"
            alt="Behind the scenes at ElgeeCosmetics"
            className="h-full w-full object-cover"
          />
        </FadeUpSection>
        <div className="flex flex-col justify-center bg-white px-6 py-16 md:px-16 md:py-0">
          <ScrollRevealText
            text="We test everything on ourselves first — every ring light, every tripod head, every formula. If we wouldn't put it in our own kit, it doesn't go in yours."
            className="text-xl leading-relaxed tracking-wide text-neutral-900 md:text-2xl"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-900 px-6 py-24 text-center md:py-32">
        <FadeUpSection className="mx-auto max-w-2xl">
          <h3 className="mb-6 text-2xl font-normal uppercase tracking-wide text-white md:text-4xl">
            See it for yourself
          </h3>
          <Link
            href="/shop"
            className="inline-block bg-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-neutral-900 transition hover:bg-neutral-200"
          >
            Shop the collection
          </Link>
        </FadeUpSection>
      </section>
    </div>
  );
}