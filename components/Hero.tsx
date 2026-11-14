import { ButtonLink } from "./ui";
import ConceptVisual from "./ConceptVisual";
import { images } from "@/lib/content";
import Image from "next/image";
import Stage3D from "./three/Stage3D";

export default function Hero() {
  const hero = images.hero;
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex h-svh min-h-[640px] overflow-hidden bg-obsidian">
      {/* Atmosphere */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_60%_at_72%_40%,#22304d_0%,#101a2e_45%,#0b1324_80%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-20 h-1/3 bg-gradient-to-b from-transparent to-[#1a2440]/60" />
      {/* Architectural line motif */}
      <div aria-hidden className="absolute inset-0 -z-10 mx-auto hidden max-w-[1440px] grid-cols-12 px-16 md:grid">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="col-span-3 border-l border-ivory/[0.04]" />
        ))}
      </div>

      {/* Tower: official render if provided, otherwise an interactive 3D concept model (SVG while loading / no WebGL) */}
      <div data-hero="visual" className="absolute inset-0 -z-10">
        <div data-drift className="relative h-full w-full">
          {hero.src ? (
            <div className="absolute right-[4%] bottom-0 h-[90%] w-[34%]">
              <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 768px) 40vw, 80vw" className="object-contain object-bottom" />
            </div>
          ) : (
            <div role="img" aria-label={`${hero.alt} (conceptual 3D model)`} className="h-full w-full">
              <Stage3D
                scene="hero"
                className="h-full w-full"
                fallback={
                  <div className="absolute right-[-18%] bottom-0 h-[78%] w-[80%] opacity-55 sm:right-[-6%] sm:w-[55%] md:right-[4%] md:h-[90%] md:w-[34%] md:opacity-100">
                    <ConceptVisual kind="tower" />
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-obsidian/90 via-obsidian/55 to-obsidian/25 md:from-obsidian/85 md:via-obsidian/20 md:to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-obsidian to-transparent" />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-center px-5 pt-24 pb-28 md:px-10 lg:px-16">
        <p data-hero="fade" className="flex items-center gap-4 text-[11px] font-medium tracking-[0.32em] text-gold uppercase">
          <span aria-hidden className="block h-px w-10 bg-gold" />
          An icon in the making
        </p>

        <h1 id="hero-title" className="mt-7 flex flex-col">
          <span data-hero="line" className="font-sans text-[clamp(1.9rem,5vw,4.25rem)] leading-[1.05] font-light tracking-[0.04em]">
            BEYOND THE ORDINARY.
          </span>
          <span
            data-hero="line"
            className="gold-sweep -mt-1 pb-2 font-serif text-[clamp(3.4rem,9vw,7.75rem)] leading-[0.95] font-normal italic"
          >
            Above Everything.
          </span>
        </h1>

        <p data-hero="fade" className="mt-6 max-w-md text-[15px] leading-relaxed text-muted md:text-base">
          Introducing The Summit by Vinayak Realty — an extraordinary destination where architectural ambition meets elevated living in
          Prayagraj.
        </p>

        <div data-hero="fade" className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <ButtonLink href="#introduction" arrow>
            Explore the Summit
          </ButtonLink>
          <ButtonLink href="#enquire" variant="outline">
            Request brochure
          </ButtonLink>
        </div>
      </div>

      <div data-hero="fade" className="absolute bottom-8 left-5 flex items-center gap-4 md:left-10 lg:left-16">
        <span aria-hidden className="scroll-line block h-14 w-px bg-ivory/15" />
        <span className="text-[10px] tracking-[0.32em] text-muted">SCROLL</span>
      </div>
      <p data-hero="fade" className="absolute right-5 bottom-8 hidden text-[10px] tracking-[0.24em] text-ivory/60 uppercase sm:block md:right-10 lg:right-16">
        {hero.src ? "Prayagraj" : "Conceptual 3D model · Prayagraj"}
      </p>
    </section>
  );
}
