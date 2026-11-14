"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { Highlight } from "./Tower";

// three.js is only downloaded in the browser, after the page is interactive
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });
const SectionScene = dynamic(() => import("./SectionScene"), { ssr: false });

type Props = {
  scene: "hero" | "section";
  /** Shown during loading and wherever WebGL is unavailable */
  fallback: ReactNode;
  highlight?: Highlight;
  className?: string;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Progressive 3D: renders the static fallback first, mounts the WebGL scene only on capable devices,
 * pauses rendering when off-screen, and freezes animation for reduced-motion users.
 */
export default function Stage3D({ scene, fallback, highlight = "none", className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [env, setEnv] = useState({ reduced: false, quality: "high" as "low" | "high", canDrag: false });

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
    setEnv({ reduced, quality: small || weak ? "low" : "high", canDrag: matchMedia("(pointer: fine)").matches });
    setEnabled(hasWebGL());

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [fallbackGone, setFallbackGone] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setFallbackGone(true), 1100); // after the cross-fade
    return () => clearTimeout(t);
  }, [ready]);

  const common = { active, reduced: env.reduced, quality: env.quality, onReady: () => setReady(true) };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {!fallbackGone && (
        <div aria-hidden={enabled} className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}>
          {fallback}
        </div>
      )}
      {enabled && (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
          {scene === "hero" ? <HeroScene {...common} /> : <SectionScene {...common} highlight={highlight} canDrag={env.canDrag} />}
        </div>
      )}
    </div>
  );
}
