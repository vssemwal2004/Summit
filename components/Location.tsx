import { ButtonLink, ConceptTag, Eyebrow } from "./ui";
import ConceptVisual from "./ConceptVisual";
import { location } from "@/lib/content";

export default function Location() {
  return (
    <section id="location" aria-labelledby="loc-title" className="on-light bg-cream text-espresso">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-5 py-24 md:grid-cols-12 md:gap-6 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="flex flex-col md:col-span-6">
          <Eyebrow tone="light">The heart of opportunity</Eyebrow>
          <h2 id="loc-title" data-reveal className="mt-7 font-serif text-[clamp(2.75rem,6vw,5rem)] leading-[0.98] font-normal">
            Rooted in Prayagraj.
            <br />
            <em className="text-bronze-deep">Designed for tomorrow.</em>
          </h2>
          <p data-reveal className="mt-8 max-w-lg text-base leading-[1.8] text-stone">
            The Summit takes its place in Prayagraj — a city of deep heritage and growing ambition. Detailed location and connectivity
            information will be shared once verified.
          </p>

          <ul className="mt-12">
            {location.highlights.map((h) => (
              <li key={h} data-reveal className="border-t border-sand py-4 font-serif text-xl text-espresso/80 last:border-b">
                {h}
              </li>
            ))}
          </ul>

          <div data-reveal className="mt-12">
            <ButtonLink href={location.mapsUrl} tone="light" arrow external>
              Explore the location
            </ButtonLink>
          </div>
        </div>

        <figure data-reveal-img className="relative m-0 aspect-square overflow-hidden md:col-span-5 md:col-start-8 md:self-center">
          <div role="img" aria-label="Stylised map placeholder" className="h-full w-full">
            <ConceptVisual kind="map" />
          </div>
          <ConceptTag tone="light">Map placeholder · exact site to be confirmed</ConceptTag>
        </figure>
      </div>
    </section>
  );
}
