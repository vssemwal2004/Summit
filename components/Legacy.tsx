"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Eyebrow } from "./ui";
import Tilt from "./Tilt";
import { legacy } from "@/lib/content";

type Filter = "All" | "Residential" | "Commercial";
const filters: Filter[] = ["All", "Residential", "Commercial"];

/** Developer track record: other Vinayak Realty projects in Prayagraj (never presented as The Summit). */
export default function Legacy() {
  const [filter, setFilter] = useState<Filter>("All");
  const withPhoto = legacy.filter((p) => p.image);
  const [active, setActive] = useState(withPhoto[0]?.name ?? "");

  const list = useMemo(() => (filter === "All" ? legacy : legacy.filter((p) => p.category === filter)), [filter]);
  const counts = {
    All: legacy.length,
    Residential: legacy.filter((p) => p.category === "Residential").length,
    Commercial: legacy.filter((p) => p.category === "Commercial").length,
  };
  const current = legacy.find((p) => p.name === active && p.image) ?? withPhoto[0];

  return (
    <section id="legacy" aria-labelledby="legacy-title" className="bg-charcoal text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-6">
          <div className="md:col-span-7">
            <Eyebrow>The developer</Eyebrow>
            <h2 id="legacy-title" data-reveal className="mt-7 font-serif text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[0.98] font-normal">
              A legacy built
              <br />
              <em className="text-gold-soft">in Prayagraj.</em>
            </h2>
          </div>
          <div data-reveal className="flex gap-10 md:col-span-4 md:col-start-9">
            <div>
              <p className="font-serif text-6xl leading-none text-gold-soft md:text-7xl">{counts.All}</p>
              <p className="mt-3 text-[11px] tracking-[0.22em] text-muted uppercase">Developments</p>
            </div>
            <p className="max-w-[16rem] text-[15px] leading-relaxed text-muted">
              Residential and commercial addresses across the city by Vinayak Realty — the foundation The Summit rises from.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-6">
          {/* Photo preview */}
          <Tilt max={4} className="md:sticky md:top-28 md:col-span-6 md:self-start">
            <figure data-reveal-img className="relative m-0 aspect-[4/3] overflow-hidden bg-obsidian">
              {withPhoto.map((p) => (
                <Image
                  key={p.name}
                  src={p.image!}
                  alt={`${p.name}, an earlier Vinayak Realty project`}
                  fill
                  sizes="(min-width: 768px) 45vw, 100vw"
                  aria-hidden={p.name !== current?.name}
                  className={`object-cover saturate-[0.7] sepia-[0.12] transition-opacity duration-700 ease-(--ease-lux) ${
                    p.name === current?.name ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-obsidian/20" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-8" aria-live="polite">
                <p className="text-[10px] tracking-[0.24em] text-gold uppercase">Earlier project · {current?.category}</p>
                <p className="mt-2 font-serif text-2xl md:text-3xl">{current?.name}</p>
                <p className="mt-2 text-[10px] tracking-[0.2em] text-ivory/60 uppercase">Not The Summit · Photo: Vinayak Realty</p>
              </figcaption>
            </figure>
          </Tilt>

          {/* Index */}
          <div className="md:col-span-5 md:col-start-8">
            <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`min-h-12 border px-4 text-[11px] tracking-[0.18em] uppercase transition-colors duration-[180ms] ease-(--ease-standard) md:min-h-11 ${
                    filter === f ? "border-gold bg-gold text-obsidian" : "border-ivory/20 text-ivory/80 hover:border-gold hover:text-ivory"
                  }`}
                >
                  {f} <span className="tabular-nums opacity-70">{counts[f]}</span>
                </button>
              ))}
            </div>

            <ul className="mt-8 border-b border-ivory/10">
              {list.map((p) => {
                const isActive = p.name === current?.name;
                const row = `flex w-full items-baseline justify-between gap-4 border-t border-ivory/10 py-4 text-left transition-colors duration-[180ms] ease-(--ease-standard)`;
                return (
                  <li key={p.name}>
                    {p.image ? (
                      <button
                        type="button"
                        onMouseEnter={() => setActive(p.name)}
                        onFocus={() => setActive(p.name)}
                        onClick={() => setActive(p.name)}
                        aria-current={isActive}
                        className={`${row} min-h-12 ${isActive ? "text-gold-soft" : "text-ivory/85 hover:text-ivory"}`}
                      >
                        <span className="font-serif text-xl md:text-2xl">{p.name}</span>
                        <span className="shrink-0 text-[10px] tracking-[0.2em] text-muted uppercase">{p.category}</span>
                      </button>
                    ) : (
                      <div className={`${row} text-ivory/60`}>
                        <span className="font-serif text-xl md:text-2xl">{p.name}</span>
                        <span className="shrink-0 text-[10px] tracking-[0.2em] text-muted uppercase">{p.category}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-muted">
              Project list as published on Vinayak Realty&apos;s website. Photographs show earlier developments and are not representations of
              The Summit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
