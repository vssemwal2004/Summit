"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * One place for all page animation. Sections stay server components and opt in with data attributes:
 *  data-hero="visual|line|fade"  → load timeline
 *  data-reveal                   → fade-up on scroll (data-delay="0.1")
 *  data-reveal-img               → clip-path image reveal
 *  data-parallax                 → subtle vertical drift inside an overflow-hidden parent
 *  data-dusk                     → dark→light overlay that fades as the section enters
 *  data-drift                    → hero visual sinks slightly as you scroll away
 */
export default function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add(
      { reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 768px)" },
      (ctx) => {
        const { reduce, desktop } = ctx.conditions as { reduce: boolean; ok: boolean; desktop: boolean };
        if (reduce) {
          root.classList.remove("motion");
          return;
        }
        root.classList.add("motion", "motion-ready");

        // 1. Cinematic hero reveal
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        // Opacity only: scaling this layer would make the WebGL canvas measure itself at the wrong size.
        // The 3D camera performs the cinematic push-in instead.
        tl.fromTo("[data-hero='visual']", { opacity: 0 }, { opacity: 1, duration: 2.4, ease: "power2.out" })
          .fromTo("[data-hero='line']", { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 }, "-=1.8")
          .fromTo("[data-hero='fade']", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, "-=0.8");

        // Hero visual drifts as the visitor scrolls away
        gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
          gsap.to(el, {
            yPercent: 12,
            ease: "none",
            scrollTrigger: { trigger: el.closest("section") ?? el, start: "top top", end: "bottom top", scrub: true },
          });
        });

        // 2. Staggered text reveals
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.09, overwrite: true }),
        });

        // 3. Image reveals
        gsap.utils.toArray<HTMLElement>("[data-reveal-img]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.6,
              ease: "power4.inOut",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        });

        // 4. Parallax (lighter on mobile)
        const amt = desktop ? 7 : 4;
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -amt },
            {
              yPercent: amt,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        // 5. Dark → light: overlay fades as the ivory section arrives
        gsap.utils.toArray<HTMLElement>("[data-dusk]").forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 1 },
            { opacity: 0, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "top 25%", scrub: true } },
          );
        });

        ScrollTrigger.refresh();
      },
    );

    return () => mm.revert();
  }, []);

  return null;
}
