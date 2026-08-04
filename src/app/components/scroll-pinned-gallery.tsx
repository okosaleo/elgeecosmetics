"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const WORDS = ["ELEGANCE", "AMENITY", "NATURE"];

const IMG_1 =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW65prgXal2DYVnhgeRlboH1ZO8kA5aF94vpqQ7";
const IMG_2 =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6KAucfGtf24i0TY5zEV1oSJUADRs6yZI7gMxk";
const IMG_3 =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6vRqhXOBbV1pxeTEA7adYlURkmj35ZnwGJr8P";
const IMG_4 =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6qBacbqSMaNoDbVJTAWs1SG07rP3HxwYhQmcy";
const IMG_5 =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6vRSXL5MbV1pxeTEA7adYlURkmj35ZnwGJr8P";

export default function ScrollPinnedGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  // resets to 0 each render, refs get assigned in the same JSX order every
  // render, so indices stay stable
  let refIndex = 0;
  const registerRef = (el: HTMLDivElement | null) => {
    imageRefs.current[refIndex] = el;
    refIndex += 1;
  };

  const goToIndex = (next: number) => {
    if (next === activeIndexRef.current) return;
    activeIndexRef.current = next;

    gsap.to([wordRef.current, numRef.current], {
      opacity: 0,
      y: -12,
      duration: 0.25,
      ease: "power1.in",
      onComplete: () => {
        setActiveIndex(next);
        gsap.fromTo(
          [wordRef.current, numRef.current],
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      },
    });
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // Pin + word-cycle only run on md+ screens. On mobile the images stack
    // full-width in normal flow (see JSX below) and pinning a 25%-width
    // column doesn't make sense there, so the animation is scoped out.
    mm.add("(min-width: 768px)", () => {
      const pinTrigger = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: leftPanelRef.current,
        pinSpacing: false,
      });

      const imageTriggers = imageRefs.current.map((el, i) => {
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: "center center",
          end: "center center",
          onEnter: () => goToIndex(i % WORDS.length),
          onEnterBack: () => goToIndex(i % WORDS.length),
        });
      });

      return () => {
        pinTrigger.kill();
        imageTriggers.forEach((t) => t && t.kill());
      };
    });

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative w-full overflow-x-clip bg-[#5f7350]">
      <div
        ref={containerRef}
        className="mx-auto flex w-full max-w-[1800px] flex-col px-4 py-12 md:flex-row md:px-6 md:py-20"
      >
        {/* Pinned text panel — normal block on mobile, sticky-pinned on md+ */}
        <div ref={leftPanelRef} className="w-full shrink-0 md:h-screen md:w-1/4">
          <div className="flex flex-col justify-center pb-10 md:h-full md:pb-0 md:-mt-28">
            <p className="text-2xl font-medium uppercase leading-tight text-neutral-100 md:text-3xl">
              We bring brands
              <br />
              to life through
            </p>
            <div className="mt-3 flex items-start">
              <span
                ref={wordRef}
                className="text-4xl font-bold uppercase text-lime-300 md:text-5xl"
              >
                {WORDS[activeIndex]}
              </span>
              <sup
                ref={numRef}
                className="ml-1 mt-1 text-lg italic text-lime-300"
              >
                {activeIndex + 1}
              </sup>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="flex w-full flex-col md:w-3/4">
          {/* Group 1 */}
          <div className="flex w-full flex-col gap-6 md:gap-0">
            {/* slot 1 */}
            <div className="relative h-64 w-full md:h-72">
              <div
                ref={registerRef}
                className="relative h-full w-full md:w-[29%]"
              >
                <Image
                  src={IMG_1}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover"
                  alt="section image"
                />
              </div>
            </div>

            {/* slot 2 */}
            <div className="flex w-full items-center justify-center">
              <div
                ref={registerRef}
                className="relative h-72 w-full md:h-[50vh] md:w-[43%]"
              >
                <Image
                  src={IMG_2}
                  fill
                  sizes="(max-width: 768px) 100vw, 43vw"
                  className="object-cover"
                  alt="section image"
                />
              </div>
            </div>

            {/* slots 3 + 4 */}
            <div className="flex w-full flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-0">
              <div
                ref={registerRef}
                className="relative h-64 w-full md:h-72 md:w-[29%]"
              >
                <Image
                  src={IMG_3}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover"
                  alt="section image"
                />
              </div>
              <div
                ref={registerRef}
                className="relative h-64 w-full md:h-[19rem] md:w-[29%]"
              >
                <Image
                  src={IMG_4}
                  fill
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="object-cover"
                  alt="section image"
                />
              </div>
            </div>
          </div>

          {/* Group 2 */}
          <div className="mt-6 flex w-full flex-col md:mt-0">
            {/* slot 5 */}
            <div className="relative flex h-64 w-full items-end justify-center md:h-72 md:w-[71.5%] md:justify-end">
              <div
                ref={registerRef}
                className="relative h-full w-full md:h-72 md:w-[40%]"
              >
                <Image
                  src={IMG_1}
                  fill
                  sizes="(max-width: 768px) 100vw, 28vw"
                  className="object-cover"
                  alt="section image"
                />
              </div>
            </div>

            {/* slot 6 */}
            <div className="mt-6 flex w-full items-center justify-center md:mt-0 md:justify-start">
              <div
                ref={registerRef}
                className="relative h-72 w-full md:h-[50vh] md:w-[43%]"
              >
                <Image
                  src={IMG_5}
                  fill
                  sizes="(max-width: 768px) 100vw, 43vw"
                  className="object-cover"
                  alt="section image"
                />
              </div>
            </div>
          </div>

          {/* slot 7 */}
          <div className="mt-6 flex w-full items-center justify-center md:mt-0 md:justify-start">
            <div
              ref={registerRef}
              className="relative h-64 w-full md:h-[19rem] md:w-[29%] md:ml-[20%]"
            >
              <Image
                src={IMG_4}
                fill
                sizes="(max-width: 768px) 100vw, 30vw"
                className="object-cover"
                alt="section image"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}