"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FadeUpSection({
  children,
  className = "",
  delay = 0,
  y = 40,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}