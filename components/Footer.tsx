import Logo from "./Logo";
import { brand, contact, credits, legal } from "@/lib/content";

const explore = [
  { label: "Architecture", href: "#architecture" },
  { label: "Residences", href: "#residences" },
  { label: "Commercial", href: "#commercial" },
  { label: "Amenities", href: "#amenities" },
  { label: "Gallery", href: "#gallery" },
  { label: "Our legacy", href: "#legacy" },
  { label: "Contact", href: "#enquire" },
];

export default function Footer() {
  return (
    <footer className="bg-deep text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 pb-10 md:px-10 md:pt-32 lg:px-16">
        <div data-reveal className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-20 grid gap-12 border-t border-ivory/10 pt-12 sm:grid-cols-2 md:grid-cols-12 md:gap-6">
          <nav aria-label="Footer" data-reveal className="md:col-span-3">
            <h2 className="text-[11px] tracking-[0.24em] text-muted uppercase">Explore</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {explore.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-line pb-0.5 text-sm text-ivory/85 hover:text-ivory">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div data-reveal className="md:col-span-4">
            <h2 className="text-[11px] tracking-[0.24em] text-muted uppercase">Office</h2>
            <address className="mt-5 flex flex-col gap-2 text-sm text-ivory/85 not-italic">
              <span>{contact.office}</span>
              <span>{contact.address}</span>
              <span>{contact.phone}</span>
              <span>{contact.email}</span>
            </address>
          </div>
          <div data-reveal className="md:col-span-4 md:col-start-9">
            <h2 className="text-[11px] tracking-[0.24em] text-muted uppercase">Website</h2>
            <p className="mt-5 text-sm text-ivory/85">{brand.website}</p>
            <h2 className="mt-8 text-[11px] tracking-[0.24em] text-muted uppercase">Regulatory</h2>
            <p className="mt-5 text-sm text-ivory/85">{legal.rera}</p>
          </div>
        </div>

        <p className="mt-16 max-w-4xl text-xs leading-relaxed text-muted">{legal.disclaimer}</p>

        <details className="mt-6 max-w-4xl text-xs text-muted">
          <summary className="inline-flex min-h-11 cursor-pointer items-center tracking-[0.16em] uppercase hover:text-ivory">Image credits</summary>
          <ul className="mt-2 grid gap-x-8 gap-y-1.5 leading-relaxed sm:grid-cols-2">
            {Object.values(credits).map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noopener noreferrer license" className="hover:text-gold hover:underline">
                  {decodeURIComponent(c.url.split("File:")[1]).replace(/_/g, " ")}
                </a>{" "}
                — {c.author}, {c.licence} (via Wikimedia Commons)
              </li>
            ))}
          </ul>
        </details>

        <div aria-hidden className="mt-10 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <div className="mt-6 flex flex-col justify-between gap-2 text-[11px] tracking-[0.16em] text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Vinayak Realty. All rights reserved.</p>
          <p>[Privacy policy] · [Terms]</p>
        </div>
      </div>
    </footer>
  );
}
