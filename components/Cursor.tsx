"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Minimal gold ring that trails the pointer. Desktop (fine pointer) only, off for reduced motion. */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const ok = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches;
    if (!ok) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      el.style.opacity = "1";
      xTo(e.clientX);
      yTo(e.clientY);
      const interactive = (e.target as Element | null)?.closest("a, button, input, textarea, select, label");
      el.dataset.active = interactive ? "true" : "false";
    };
    const leave = () => (el.style.opacity = "0");

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ring}
      aria-hidden
      data-active="false"
      className="pointer-events-none fixed top-0 left-0 z-[90] -mt-4 -ml-4 size-8 rounded-full border border-gold/70 opacity-0 transition-[width,height,margin,background-color,opacity] duration-300 data-[active=true]:-mt-7 data-[active=true]:-ml-7 data-[active=true]:size-14 data-[active=true]:bg-gold/10"
    />
  );
}
