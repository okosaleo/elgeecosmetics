"use client"
import { DiscountIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import gsap from 'gsap';
import Link from 'next/link';
import React, { useRef } from 'react'

export default function DiscountButton() {
    const iconRef = useRef(null);
    const handleEnter = () => {
  gsap.to(iconRef.current, {
    y: -8,
    duration: 0.4,
    ease: "power1.inOut",
    repeat: -1,
    yoyo: true,
  });
};

const handleLeave = () => {
  gsap.killTweensOf(iconRef.current);
  gsap.to(iconRef.current, { y: 0, duration: 0.2 });
};
  return (
    <Link
  href="/"
  onMouseEnter={handleEnter}
   onMouseLeave={handleLeave}
  className="absolute z-30 cursor-pointer md:bottom-12 right-0 top-36 bg-black md:w-60 w-40 px-2 h-15 flex items-center justify-center"
>
  <h1 className="flex items-center gap-1 font-medium tracking-wide md:text-lg text-xs text-red-400 hover:text-green-400">
    GET 20% DISCOUNT

    <span ref={iconRef}>
      <HugeiconsIcon
        icon={DiscountIcon}
        size={15}
        color="currentColor"
        strokeWidth={2.0}
      />
    </span>
  </h1>
</Link>
  )
}
