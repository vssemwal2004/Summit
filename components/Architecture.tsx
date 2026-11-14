"use client";

import { useState } from "react";
import { Move3d } from "lucide-react";
import { Eyebrow } from "./ui";
import Media from "./Media";
import Stage3D from "./three/Stage3D";
import type { Highlight } from "./three/Tower";

const parts: { n: string; key: Exclude<Highlight, "none">; title: string; sub: string; body: string }[] = [
  {
    n: "01",
    key: "commercial",
    title: "Commercial Excellence",
    sub: "Ground, First & Second Floors",
    body: "A thoughtfully envisioned destination for premium retail, dining and commercial experiences.",
  },
  {
    n: "02",
    key: "residential",
    title: "Elevated Residences",
    sub: "Upper Residential Floors",
    body: "An exclusive residential environment designed around privacy, comfort, sophisticated living and elevated perspectives.",
  },
];

export default function Architecture() {
  const [highlight, setHighlight] = useState<Highlight>("none");

  return (
    <section id="architecture" aria-labelledby="arch-title" className="bg-charcoal text-ivory">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-24 md:grid-cols-12 md:gap-6 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="md:col-span-6">
          <div className="relative md:sticky md:top-24">
            <div
              data-reveal-img
              role="img"
              aria-label="Conceptual 3D model of the tower showing the commercial podium and residential floors"
              className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(ellipse_at_50%_35%,#22304d_0%,#0b1324_70%)] md:aspect-[5/6]"
            >
              <Stage3D
                scene="section"
                highlight={highlight}
                className="h-full w-full"
                fallback={<Media image="section" kind="tower-section" reveal={false} className="h-full w-full" tag="Conceptual section" />}
              />
              <div className="pointer-events-none absolute top-5 left-5 flex flex-col gap-2 text-[10px] tracking-[0.22em] uppercase">
                <span className={`transition-colors duration-[180ms] ${highlight === "residential" ? "text-gold-soft" : "text-ivory/60"}`}>
                  ↑ Residences
                </span>
                <span className={`transition-colors duration-[180ms] ${highlight === "commercial" ? "text-gold-soft" : "text-ivory/60"}`}>
                  ▣ G + 2 Commercial
                </span>
              </div>
              <span className="pointer-events-none absolute bottom-4 left-5 text-[10px] tracking-[0.24em] text-ivory/60 uppercase">Conceptual 3D model</span>
              <span className="pointer-events-none absolute right-5 bottom-4 hidden items-center gap-2 text-[10px] tracking-[0.24em] text-ivory/60 uppercase [@media(pointer:fine)]:flex">
                <Move3d aria-hidden className="size-3.5" strokeWidth={1.5} /> Drag to rotate
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
          <Eyebrow>The architectural vision</Eyebrow>
          <h2 id="arch-title" data-reveal className="mt-7 font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.95] font-normal">
            Designed to
            <br />
            <em className="text-gold-soft">rise above.</em>
          </h2>
          <p data-reveal className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            Select a zone to light it up on the model.
          </p>

          <ul className="mt-10 border-b border-gold/40">
            {parts.map((p) => {
              const on = highlight === p.key;
              return (
                <li key={p.n} data-reveal className="border-t border-gold/40">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setHighlight(on ? "none" : p.key)}
                    onMouseEnter={() => setHighlight(p.key)}
                    onFocus={() => setHighlight(p.key)}
                    className={`grid w-full grid-cols-[56px_1fr] gap-x-5 py-8 text-left transition-colors duration-[180ms] ease-(--ease-standard) md:grid-cols-[80px_1fr] md:gap-x-6 ${
                      on ? "bg-gold/[0.06]" : "hover:bg-ivory/[0.02]"
                    }`}
                  >
                    <span className={`font-serif text-4xl leading-none transition-colors ${on ? "text-gold-soft" : "text-gold"}`}>{p.n}</span>
                    <span className="flex flex-col gap-2.5">
                      <span className="text-sm font-medium tracking-[0.24em] uppercase">{p.title}</span>
                      <span className="text-[11px] tracking-[0.18em] text-gold uppercase">{p.sub}</span>
                      <span className="mt-1 max-w-[30rem] text-[15px] leading-[1.75] text-muted">{p.body}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
