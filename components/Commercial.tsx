import { ButtonLink, Eyebrow } from "./ui";
import Media from "./Media";
import Tilt from "./Tilt";
import { commercialHighlights } from "@/lib/content";

export default function Commercial() {
  return (
    <section id="commercial" aria-labelledby="com-title" className="on-light bg-cream text-espresso">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-6">
          <div className="md:col-span-7">
            <Eyebrow tone="light">A destination for business &amp; lifestyle</Eyebrow>
            <h2 id="com-title" data-reveal className="mt-7 font-serif text-[clamp(2.75rem,6.4vw,5.5rem)] leading-[0.98] font-normal">
              Where ambition
              <br />
              <em className="text-bronze-deep">meets opportunity.</em>
            </h2>
          </div>
          <p data-reveal className="text-base leading-[1.8] text-stone md:col-span-4 md:col-start-9">
            The ground, first and second floors are planned as a commercial address — a setting for considered retail, dining and business.
          </p>
        </div>

        {/* Asymmetric editorial composition */}
        <div className="mt-16 grid gap-5 md:mt-24 md:grid-cols-12 md:gap-6">
          <Tilt max={3} className="relative md:col-span-7 md:row-span-2">
            <Media image="retail" kind="retail" tone="light" parallax className="aspect-[4/5] md:aspect-auto md:h-full md:min-h-[640px]" sizes="(min-width: 768px) 58vw, 100vw" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/80 to-transparent px-6 pt-24 pb-12 text-ivory md:px-10 [transform:translateZ(40px)]">
              <p className="text-[11px] tracking-[0.24em] text-gold-soft uppercase">Ground floor</p>
              <p className="mt-2 font-serif text-3xl md:text-4xl">Luxury retail frontage</p>
            </div>
          </Tilt>
          <Tilt className="md:col-span-4 md:col-start-9 md:mt-24">
            <Media image="dining" kind="dining" className="aspect-[4/3]" sizes="(min-width: 768px) 33vw, 100vw" />
          </Tilt>
          <Tilt className="md:col-span-5 md:col-start-8">
            <Media image="office" kind="office" tone="light" className="aspect-[4/3]" sizes="(min-width: 768px) 40vw, 100vw" />
          </Tilt>
        </div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-12 md:gap-6">
          <ul className="md:col-span-8">
            {commercialHighlights.map((h, i) => (
              <li key={h} data-reveal className="flex items-baseline gap-6 border-t border-sand py-5 last:border-b md:gap-10">
                <span className="w-8 shrink-0 font-serif text-lg text-bronze-deep">0{i + 1}</span>
                <span className="font-serif text-[clamp(1.6rem,3vw,2.5rem)] leading-tight">{h}</span>
              </li>
            ))}
          </ul>
          <div data-reveal className="flex items-end md:col-span-3 md:col-start-10">
            <ButtonLink href="#enquire" tone="light" arrow>
              Explore commercial spaces
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
