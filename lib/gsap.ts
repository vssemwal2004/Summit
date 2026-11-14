"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  // Follow real time even if a frame is slow (e.g. WebGL on a weak phone),
  // so text reveals always finish instead of crawling.
  gsap.ticker.lagSmoothing(0);
}

export { gsap, ScrollTrigger };
