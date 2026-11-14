import { ButtonLink } from "./ui";
import Media from "./Media";
import Logo from "./Logo";

/** Signature full-screen statement before the enquiry form */
export default function Closing() {
  return (
    <section aria-labelledby="closing-title" className="relative isolate flex min-h-svh items-center overflow-hidden bg-obsidian text-ivory">
      <Media image="night" kind="tower-night" tag="Conceptual nighttime visual" parallax className="!absolute inset-0 -z-10" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-obsidian/85 via-obsidian/40 to-obsidian/10" />

      <div className="mx-auto w-full max-w-[1440px] px-5 py-32 md:px-10 lg:px-16">
        <h2 id="closing-title" className="font-serif text-[clamp(3rem,8vw,7.5rem)] leading-[0.95] font-normal">
          <span data-reveal className="block">Some addresses</span>
          <span data-reveal className="block">are destined</span>
          <em data-reveal className="block text-gold-soft">to become icons.</em>
        </h2>
        <div data-reveal className="mt-12">
          <Logo size="sm" />
        </div>
        <div data-reveal className="mt-10">
          <ButtonLink href="#enquire" arrow>
            Enquire now
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
