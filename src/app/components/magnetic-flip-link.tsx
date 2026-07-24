"use client";
import { forwardRef, useImperativeHandle, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";

interface FlipLinkProps {
  href: string;
  label: string;
  textColor?: string;
  accentColor?: string; // color of the revealed duplicate line + the leader line, defaults to textColor
}

export interface FlipLinkHandle {
  /** Instantly kills any in-flight tween and snaps the link back to its resting state. */
  reset: () => void;
}

export const FlipLink = forwardRef<FlipLinkHandle, FlipLinkProps>(
  ({ href, label, textColor = "#17301C", accentColor }, ref) => {
    const topRef = useRef<HTMLSpanElement>(null);
    const bottomRef = useRef<HTMLSpanElement>(null);
    const lineRef = useRef<HTMLSpanElement>(null);
    const dotRef = useRef<HTMLSpanElement>(null);
    const arrowRef = useRef<HTMLSpanElement>(null);
    const iconWrapRef = useRef<HTMLSpanElement>(null);
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const allTargets = () => [
      topRef.current,
      bottomRef.current,
      lineRef.current,
      dotRef.current,
      arrowRef.current,
      iconWrapRef.current,
    ];

    const killAll = () => {
      tlRef.current?.kill();
      gsap.killTweensOf(allTargets());
    };

    const handleEnter = () => {
      killAll();
      const tl = gsap.timeline();
      tlRef.current = tl;

      // text flip
      tl.to(topRef.current, { yPercent: -100, duration: 0.5, ease: "expo.out" }, 0);
      tl.to(bottomRef.current, { yPercent: -100, duration: 0.5, ease: "expo.out" }, 0);

      // dot -> arrow swap, then the icon nudges left to open up room
      tl.to(dotRef.current, { opacity: 0, scale: 0.3, duration: 0.2, ease: "power2.out" }, 0);
      tl.to(arrowRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, 0.05);
      tl.to(iconWrapRef.current, { x: -6, duration: 0.35, ease: "power3.out" }, 0.05);

      // line draws in to fill the space that just opened up, from the icon side
      tl.to(lineRef.current, { scaleX: 1, duration: 0.45, ease: "expo.out" }, 0.15);
    };

    const handleLeave = () => {
      killAll();
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(topRef.current, { yPercent: 0, duration: 0.45, ease: "power3.inOut" }, 0);
      tl.to(bottomRef.current, { yPercent: 0, duration: 0.45, ease: "power3.inOut" }, 0);
      tl.to(lineRef.current, { scaleX: 0, duration: 0.35, ease: "power3.inOut" }, 0);
      tl.to(iconWrapRef.current, { x: 0, duration: 0.35, ease: "power3.inOut" }, 0);
      tl.to(arrowRef.current, { opacity: 0, scale: 0.4, duration: 0.2, ease: "power2.inOut" }, 0);
      tl.to(dotRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.1);
    };

    // Exposed so the parent nav can force a reset when the menu closes/route
    // changes — this is what prevents links from ever getting stuck mid-hover.
    useImperativeHandle(ref, () => ({
      reset: () => {
        killAll();
        gsap.set(topRef.current, { yPercent: 0 });
        gsap.set(bottomRef.current, { yPercent: 0 });
        gsap.set(lineRef.current, { scaleX: 0 });
        gsap.set(iconWrapRef.current, { x: 0 });
        gsap.set(dotRef.current, { opacity: 1, scale: 1 });
        gsap.set(arrowRef.current, { opacity: 0, scale: 0.4 });
      },
    }));

    return (
      <Link
        href={href}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="relative flex w-full items-center py-1 px-3 rounded-md text-lg md:text-xl leading-tight"
      >
        {/* label, flipping */}
        <span
          className="relative block shrink-0 overflow-hidden"
          style={{ height: "1.2em" }}
        >
          <span ref={topRef} className="block" style={{ color: textColor }}>
            {label}
          </span>
          <span
            ref={bottomRef}
            className="absolute left-0 top-0 block"
            style={{ color: accentColor ?? textColor, transform: "translateY(100%)" }}
          >
            {label}
          </span>
        </span>

        {/* leader line: gap, then fills the rest of the row, drawing in from the right */}
        <span className="ml-3 h-px flex-1 overflow-hidden">
          <span
            ref={lineRef}
            className="block h-full w-full origin-right"
            style={{
              backgroundColor: accentColor ?? textColor,
              transform: "scaleX(0)",
            }}
          />
        </span>

        {/* dot at rest, morphs into an arrow (and nudges left) on hover */}
        <span
          ref={iconWrapRef}
          className="relative ml-2 w-4 h-4 flex items-center justify-center shrink-0"
        >
          <span
            ref={dotRef}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: accentColor ?? textColor }}
          />
          <span ref={arrowRef} className="absolute inset-0 flex items-center justify-center opacity-0" style={{ transform: "scale(0.4)" }}>
            <HugeiconsIcon
              icon={ArrowRight02Icon}
              size={15}
              color={accentColor ?? textColor}
              strokeWidth={1.5}
            />
          </span>
        </span>
      </Link>
    );
  }
);

FlipLink.displayName = "FlipLink";