// components/ritual-stack.tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export type RitualPanel = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  thumbnail?: string;
  bg: string;
  fg?: string;
  ctaLabel?: string;
  imageSide?: 'left' | 'right';
};

export default function RitualStack({ panels }: { panels: RitualPanel[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<HTMLDivElement[]>([]);
  const imgRefs = useRef<HTMLDivElement[]>([]);
  const contentRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ctx = gsap.context(() => {
      const panelEls = panelRefs.current;

      // Base panel sits still underneath everything.
      gsap.set(panelEls[0], { yPercent: 0 });

      // Every panel after the first starts off-screen below and slides
      // up to cover whatever's beneath it.
      for (let i = 1; i < panelEls.length; i++) {
        gsap.set(panelEls[i], { yPercent: 100 });
        gsap.set(imgRefs.current[i], { scale: 1.35, transformOrigin: '50% 50%' });
        gsap.set(contentRefs.current[i], { autoAlpha: 0, y: 32 });
      }

      const distance = () => (panelEls.length - 1) * window.innerHeight;

      // Single pin covering the whole sequence — this is what makes
      // "not yet moving" panels actually stay frozen instead of
      // scrolling away on their own.
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        anticipatePin: 1,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 1,
        },
      });

      // One "slide-over" segment per panel, back to back on the timeline.
      for (let i = 1; i < panelEls.length; i++) {
        const seg = i - 1;
        tl.to(panelEls[i], { yPercent: 0, duration: 1, ease: 'none' }, seg)
          .to(imgRefs.current[i], { scale: 1, duration: 1, ease: 'none' }, seg)
          .to(contentRefs.current[i], { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }, seg + 0.15);
      }
    }, wrapper);

    return () => ctx.revert();
  }, [panels.length]);

  return (
    <div ref={wrapperRef} className="relative h-screen w-full overflow-hidden">
      {panels.map((p, i) => (
        <div
          key={i}
          ref={(el) => { if (el) panelRefs.current[i] = el; }}
          className={`absolute inset-0 flex flex-col md:flex-row ${
            p.imageSide === 'right' ? 'md:flex-row-reverse' : ''
          }`}
          style={{ background: p.bg, color: p.fg ?? '#111', zIndex: i }}
        >
          <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden">
            <div ref={(el) => { if (el) imgRefs.current[i] = el; }} className="absolute inset-0 will-change-transform">
              <img src={p.image} alt="" className="w-full h-full object-cover block" />
            </div>
          </div>

          <div className="w-full h-1/2 md:h-full md:w-1/2 flex items-center justify-center p-8 md:p-16 box-border">
            <div ref={(el) => { if (el) contentRefs.current[i] = el; }} className="max-w-[440px] text-center">
              {p.eyebrow && <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-3">{p.eyebrow}</p>}
              <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-medium uppercase tracking-tight leading-none mb-3">
                {p.title}
              </h2>
              <p className="italic text-lg opacity-75 mb-10">{p.subtitle}</p>
              {p.thumbnail && (
                <div className="w-[190px] h-[140px] mx-auto mb-7 rounded-none overflow-hidden">
                  <img src={p.thumbnail} alt="" className="w-full h-full object-cover block" />
                </div>
              )}
              <a
                href="#"
                className="inline-flex font-semibold items-center gap-1.5 text-sm tracking-[0.12em] uppercase no-underline border-b pb-1"
                style={{ borderColor: p.fg ?? '#111', color: p.fg ?? '#111' }}
              >
                {p.ctaLabel ?? 'Explore'} <span>+</span>
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}