import { ButtonLink, Eyebrow } from "./ui";
import Media from "./Media";
import { brand } from "@/lib/content";

const facts = [
  { k: "Commercial", v: "Ground – Second floors" },
  { k: "Residences", v: "Upper floors" },
  { k: "Location", v: `${brand.city}, U.P.` },
];

export default function Introduction() {
  return (
    <section id="introduction" aria-labelledby="intro-title" className="on-light relative isolate bg-cream text-espresso">
      {/* Dark→light transition layer (only rendered when motion is on) */}
      <div data-dusk aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden bg-obsidian [.motion_&]:block" />

      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="grid gap-10 md:grid-cols-12 md:items-end md:gap-6">
          <div className="md:col-span-7">
            <Eyebrow tone="light">A new landmark for Prayagraj</Eyebrow>
            <h2 id="intro-title" data-reveal className="mt-7 font-serif text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.01em]">
              Not just a destination.
              <br />
              <em className="text-bronze-deep">A defining statement.</em>
            </h2>
          </div>
          <div className="flex flex-col gap-5 text-base leading-[1.8] text-stone md:col-span-4 md:col-start-9 md:pb-2">
            <p data-reveal>
              The Summit by Vinayak Realty is envisioned as a distinguished mixed-use destination, bringing together premium commercial
              experiences and elevated residential living.
            </p>
            <p data-reveal>An architectural expression of ambition, sophistication and contemporary urban lifestyle.</p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-6">
          <Media image="intro" kind="tower-light" tone="light" parallax className="aspect-[4/3] md:col-span-8 md:aspect-[16/9]" sizes="(min-width: 768px) 66vw, 100vw" />
          <div className="flex flex-col justify-between gap-10 border-t border-bronze pt-6 md:col-span-4">
            <dl className="flex flex-col gap-6">
              {facts.map((f) => (
                <div key={f.k} data-reveal className="flex items-baseline justify-between gap-4 border-b border-sand pb-4">
                  <dt className="text-[11px] tracking-[0.22em] text-stone uppercase">{f.k}</dt>
                  <dd className="m-0 text-right font-serif text-2xl">{f.v}</dd>
                </div>
              ))}
            </dl>
            <div data-reveal>
              <ButtonLink href="#architecture" variant="line" tone="light" arrow>
                Discover the vision
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
