import { ButtonLink, Eyebrow } from "./ui";
import Media from "./Media";
import { residenceHighlights } from "@/lib/content";

export default function Residences() {
  return (
    <section id="residences" aria-labelledby="res-title" className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="max-w-4xl">
          <Eyebrow>An elevated way of life</Eyebrow>
          <h2 id="res-title" data-reveal className="mt-7 font-serif text-[clamp(3rem,7.5vw,6.5rem)] leading-[0.95] font-normal">
            Life looks different
            <br />
            <em className="text-gold-soft">from above.</em>
          </h2>
        </div>

        <Media image="interior" kind="interior" tag="Conceptual interior" parallax className="mt-16 aspect-[4/3] md:mt-24 md:aspect-[21/9]" sizes="100vw" />

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-6">
          <div className="flex flex-col gap-10 md:col-span-5">
            <p data-reveal className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-snug text-ivory/90">
              Discover a residential experience envisioned around elegance, comfort, privacy and a distinctive sense of arrival.
            </p>
            <div data-reveal>
              <ButtonLink href="#enquire" variant="line" arrow>
                Discover the residences
              </ButtonLink>
            </div>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2 md:col-span-6 md:col-start-7">
            {residenceHighlights.map((h) => (
              <li key={h} data-reveal className="border-t border-gold/35 pt-4 pb-8 text-xs tracking-[0.2em] text-ivory/85 uppercase">
                {h}
              </li>
            ))}
          </ul>
        </div>

        <Media image="skyline" kind="skyline" tag="Conceptual perspective" parallax className="mt-12 aspect-[16/9] md:ml-[33%] md:aspect-[2/1]" sizes="(min-width: 768px) 66vw, 100vw" />
      </div>
    </section>
  );
}
