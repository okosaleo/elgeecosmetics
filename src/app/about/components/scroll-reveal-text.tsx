"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ScrollRevealText({
  text,
  className = "",
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "h3";
}) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll<HTMLSpanElement>(".word");

      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom 55%",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const words = text.split(" ");

  return (
    <Tag ref={containerRef as never} className={className}>
      {words.map((word, i) => (
        <span key={i} className="word inline-block opacity-15">
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}