import { Eyebrow } from "./ui";
import Media from "./Media";
import { amenities } from "@/lib/content";

export default function Amenities() {
  return (
    <section id="amenities" aria-labelledby="amen-title" className="on-light bg-cream text-espresso">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-24 md:grid-cols-12 md:gap-6 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <Eyebrow tone="light">Crafted for an extraordinary lifestyle</Eyebrow>
            <h2 id="amen-title" data-reveal className="mt-7 font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] font-normal">
              Every detail.
              <br />
              <em className="text-bronze-deep">A higher standard.</em>
            </h2>
            <Media image="lobby" kind="lobby" tone="light" className="mt-12 aspect-[4/5]" sizes="(min-width: 768px) 40vw, 100vw" />
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7 md:pt-40">
          <p data-reveal className="mb-10 text-[11px] tracking-[0.24em] text-bronze-deep uppercase">Envisioned features</p>
          <ol>
            {amenities.map((a, i) => (
              <li key={a.title} data-reveal className="grid grid-cols-[40px_1fr] gap-x-5 border-t border-sand py-6 last:border-b md:grid-cols-[56px_1fr]">
                <span className="pt-1 font-serif text-lg text-bronze-deep">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-tight font-normal">{a.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-stone">{a.note}</p>
                </div>
              </li>
            ))}
          </ol>
          <p data-reveal className="mt-8 max-w-md text-xs leading-relaxed text-stone">
            Features shown are proposed, based on the initial project concept, and subject to approvals and final design development.
          </p>
        </div>
      </div>
    </section>
  );
}
