"use client";
import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import { FlipLink, FlipLinkHandle } from "./magnetic-flip-link";
import { CartButton } from "@/components/cart/cart-button";
import { authClient } from "@/lib/auth-client";

export interface SimpleNavProps {
  logo?: string | StaticImageData;
  logoAlt?: string;
  title?: string; // text wordmark, e.g. "L'OISEAU DÉ" — takes priority over `logo` if set
  className?: string;
  ease?: string;
  baseColor?: string;
  navTextColor?: string;
  /** Set to false to hide the cart trigger entirely on this page (e.g. checkout). Defaults to true. */
  showCart?: boolean;
  /** Caption shown above the footer image, e.g. "Happy to see you again" */
  footerCaption?: string;
  /** Footer image src. Swap this for your own asset — a placeholder is used until then. */
  footerImage?: string | StaticImageData;
  footerImageAlt?: string;
}

const PLACEHOLDER_IMAGE =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6hadZ3RFOj79AxJuTmzgXeY25HURKGBZqyDrV";

const SimpleNav: React.FC<SimpleNavProps> = ({
  logo,
  logoAlt = "Logo",
  title,
  className = "",
  ease = "power3.out",
  baseColor = "rgba(255, 255, 255, 0.92)",
  navTextColor = "#17301C",
  showCart = true,
  footerCaption = "Happy to see you again",
  footerImage = PLACEHOLDER_IMAGE,
  footerImageAlt = "Nav footer",
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const navRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimating = useRef(false);
  const linkRefs = useRef<(FlipLinkHandle | null)[]>([]);

  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop" },
    { label: "About", href: "/about" },
    ...(session?.user ? [] : [{ label: "Login", href: "/login" }]),
  ];

  // Snaps every link back to its resting state. Call this any time the panel
  // closes through something other than a literal mouseleave (hamburger
  // click, route change) so a link can never get left mid-hover.
  const resetAllLinks = () => {
    linkRefs.current.forEach((link) => link?.reset());
  };

  const calculateHeight = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const topBar = 60;
    const navItemHeight = (isMobile ? 50 : 40) * navItems.length;
    const footerBlock = 168; // caption + image + spacing
    const padding = isMobile ? 32 : 24;
    return topBar + navItemHeight + footerBlock + padding;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    const contentEl = contentRef.current;
    if (!navEl || !contentEl) return null;

    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(contentEl, { y: 30, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight(),
      duration: 0.4,
      ease,
    });

    tl.to(
      contentEl,
      { y: 0, opacity: 1, duration: 0.4, ease },
      "-=0.2"
    );

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease]);

  // Route change: close instantly and make sure no link is left stuck.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl || !navRef.current) return;

    setIsExpanded(false);
    setIsHamburgerOpen(false);
    isAnimating.current = false;
    resetAllLinks();

    tl.pause(0);
    gsap.set(navRef.current, { height: 60 });
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (!navRef.current) return;

      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
      } else {
        gsap.set(navRef.current, { height: 60 });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl || isAnimating.current) return;

    isAnimating.current = true;

    if (!isExpanded) {
      setIsExpanded(true);
      setIsHamburgerOpen(true);

      tl.play(0).eventCallback("onComplete", () => {
        isAnimating.current = false;
      });
    } else {
      setIsExpanded(false);
      setIsHamburgerOpen(false);
      // The mouse may still be sitting over a link when the panel collapses —
      // this is what used to leave the text flipped / line drawn in.
      resetAllLinks();

      tl.reverse().eventCallback("onReverseComplete", () => {
        isAnimating.current = false;
      });
    }
  };

  return (
    <div
      className={`nav-container  fixed left-4 top-4 md:left-6 md:top-6 z-[99] ${className}`}
    >
      <nav
        ref={navRef}
        className="simple-nav border-gray-300 border block p-0 rounded-xs relative overflow-hidden backdrop-blur-md
          w-[calc(100vw-2rem)] max-w-[380px] md:w-[300px]
          transition-[width] duration-[400ms] ease-out"
        style={{ backgroundColor: baseColor }}
      >
        {/* TOP BAR */}
        <div className="h-15 flex items-center  justify-between gap-4 px-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            {title ? (
              <span
                className="text-sm font-medium tracking-wide uppercase"
                style={{ color: navTextColor }}
              >
                {title}
              </span>
            ) : logo ? (
              <Image src={logo} alt={logoAlt} width={100} height={32} />
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {showCart && <CartButton textColor={navTextColor} />}

            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className="flex flex-col items-center justify-center gap-1.5 w-6 h-6 shrink-0"
              style={{ color: navTextColor }}
            >
              <span
                className={`block w-5 h-[1.5px] bg-current transition ${
                  isHamburgerOpen ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`block w-5 h-[1.5px] bg-current transition ${
                  isHamburgerOpen ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div
          ref={contentRef}
          className={`absolute left-0 right-0 top-[60px] bottom-0 px-4 pb-2 flex flex-col ${
            isExpanded
              ? "visible pointer-events-auto"
              : "invisible pointer-events-none"
          }`}
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item, idx) => (
              <FlipLink
                key={item.href}
                ref={(el) => {
                  linkRefs.current[idx] = el;
                }}
                href={item.href}
                label={item.label}
                textColor={navTextColor}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <span
              className="text-xs italic tracking-wide"
              style={{ color: navTextColor }}
            >
              {footerCaption}
            </span>
            <div className="relative w-full h-[150px] overflow-hidden rounded-xs">
              {typeof footerImage === "string" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={footerImage}
                  alt={footerImageAlt}
                  className="w-full h-full object-cover rounded-xs"
                />
              ) : (
                <Image
                  src={footerImage}
                  alt={footerImageAlt}
                  fill
                  className="object-cover rounded-xs"
                />
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SimpleNav;