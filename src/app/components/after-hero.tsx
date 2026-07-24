"use client";
import React, { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Swap this for your own asset whenever it's ready.
const PLACEHOLDER_IMAGE =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW61jyPPFTDcqf6IVsjvbyeGHu0JDkPEr45idNm";

export default function AfterHero() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null); // clipping container
  const imgRef = useRef<HTMLDivElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null); // curtain that wipes away

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // resting state before it enters view
      gsap.set(imgRef.current, { scale: 1.25 });
      gsap.set(maskRef.current, { scaleY: 1 });

      // one-time reveal: curtain wipes up, image settles from a slight zoom
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 80%",
          once: true,
        },
        defaults: { ease: "power4.inOut" },
      });

      tl.to(maskRef.current, {
        scaleY: 0,
        transformOrigin: "top",
        duration: 1.1,
      }).to(
        imgRef.current,
        { scale: 1, duration: 1.6, ease: "power3.out" },
        "-=0.85"
      );

      // subtle continuous parallax while the section scrolls through view
      gsap.to(imgRef.current, {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full bg-white min-h-screen flex py-24 items-center flex-col gap-16 px-6"
    >
      <div className="max-w-8xl">
        <h1 className="text-4xl font-medium tracking-wide text-center">
          ELGEECOSMETICS IS REDEFINING BEAUTY IN AFRICA.
        </h1>
        <p className="text-3xl text-center mt-5 italic">
          At prices Africans love to hear
        </p>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full max-w-5xl h-[60vh] md:h-[90vh] overflow-hidden rounded-sm"
      >
        <div ref={imgRef} className="absolute inset-0 will-change-transform">
          <Image
            src={PLACEHOLDER_IMAGE}
            alt="Elgeecosmetics"
            fill
            priority={false}
            className="object-contain"
          />
        </div>

        {/* curtain that wipes upward to reveal the image */}
        <div
          ref={maskRef}
          className="absolute inset-0 z-10 bg-[#17301C]"
          style={{ transformOrigin: "top" }}
        />
      </div>
    </div>
  );
}