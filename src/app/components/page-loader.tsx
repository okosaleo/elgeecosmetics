"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const WORDMARK = "ELGEECOSMETICS";
const SESSION_KEY = "elgee-loader-shown";

export function PageLoader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Already played once this tab — skip straight to hidden, no animation,
    // no flash. The overlay markup is always rendered (see JSX below) so
    // this ref is guaranteed to exist by the time this effect runs.
    if (sessionStorage.getItem(SESSION_KEY)) {
      if (overlayRef.current) overlayRef.current.style.display = "none";
      return;
    }

    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const counterState = { value: 0 };
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          document.body.style.overflow = "";
          sessionStorage.setItem(SESSION_KEY, "1");
        },
      });

      // letters rise out of their masks
      tl.fromTo(
        lettersRef.current,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.035, ease: "power4.out" }
      );

      // progress bar + counter tick up together, scrubbed by one tween
      tl.to(
        counterState,
        {
          value: 100,
          duration: 1.3,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(
                Math.round(counterState.value)
              ).padStart(3, "0");
            }
            if (barRef.current) {
              barRef.current.style.width = `${counterState.value}%`;
            }
          },
        },
        "-=0.35"
      );

      // hold for a beat so 100% is actually readable
      tl.to({}, { duration: 0.15 });

      // letters drop back down as the panel prepares to wipe
      tl.to(lettersRef.current, {
        yPercent: -110,
        duration: 0.5,
        stagger: 0.02,
        ease: "power3.in",
      });

      // diagonal clip-path wipe reveals the page underneath
      tl.to(
        panelRef.current,
        {
          clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          duration: 0.8,
          ease: "power4.inOut",
        },
        "-=0.15"
      );

      tl.set(overlayRef.current, { display: "none" });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#17301C]"
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        className="absolute inset-0 flex items-center justify-center bg-[#17301C]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex overflow-hidden">
            {WORDMARK.split("").map((char, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <span
                  ref={(el) => {
                    lettersRef.current[i] = el;
                  }}
                  className="inline-block text-[9vw] font-normal uppercase tracking-wide text-lime-300 sm:text-5xl"
                  style={{ transform: "translateY(110%)" }}
                >
                  {char}
                </span>
              </span>
            ))}
          </div>

          <div className="flex w-40 flex-col items-center gap-2 sm:w-56">
            <div className="h-px w-full overflow-hidden bg-white/15">
              <div ref={barRef} className="h-full w-0 bg-lime-300" />
            </div>
            <span
              ref={counterRef}
              className="font-mono text-xs tracking-widest text-white/60"
            >
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}