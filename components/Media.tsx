import Image from "next/image";
import ConceptVisual, { type VisualKind } from "./ConceptVisual";
import { ConceptTag } from "./ui";
import { images, type Credit } from "@/lib/content";

/** Caption + licence credit on a photo (credit links to the source page, as CC licences require) */
export function PhotoCaption({ label, credit }: { label?: string; credit?: Credit }) {
  return (
    <figcaption className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] bg-deep/70 px-3 py-2 text-[10px] leading-relaxed tracking-[0.14em] text-ivory/90 backdrop-blur-sm">
      {label && <span className="block uppercase">{label}</span>}
      {credit && (
        <a href={credit.url} target="_blank" rel="noopener noreferrer license" className="text-ivory/70 underline-offset-2 hover:text-gold hover:underline">
          Photo: {credit.author} · {credit.licence}
        </a>
      )}
    </figcaption>
  );
}

type Props = {
  /** key in lib/content.ts `images` */
  image: keyof typeof images;
  kind: VisualKind;
  tone?: "dark" | "light";
  className?: string;
  sizes?: string;
  priority?: boolean;
  parallax?: boolean;
  reveal?: boolean;
  tag?: string;
};

/**
 * Shows the official render if one is configured in content.ts,
 * otherwise a labelled conceptual visual. Optional reveal + parallax hooks for Motion.
 */
export default function Media({ image, kind, tone = "dark", className = "", sizes = "100vw", priority, parallax, reveal = true, tag }: Props) {
  const img = images[image];
  const inner = img?.src ? (
    <Image src={img.src} alt={img.alt} fill sizes={sizes} priority={priority} className="object-cover" />
  ) : (
    <div role="img" aria-label={`${img?.alt ?? "Conceptual visual"} (conceptual)`} className="h-full w-full">
      <ConceptVisual kind={kind} />
    </div>
  );

  return (
    <figure {...(reveal ? { "data-reveal-img": "" } : {})} className={`relative m-0 overflow-hidden ${className}`}>
      <div {...(parallax ? { "data-parallax": "" } : {})} className={`absolute inset-0 ${parallax ? "-top-[8%] -bottom-[8%]" : ""}`}>
        {inner}
      </div>
      {!img?.src && <ConceptTag tone={tone}>{tag ?? "Conceptual visual"}</ConceptTag>}
      {img?.src && (img.label || img.credit) && <PhotoCaption label={img.label} credit={img.credit} />}
    </figure>
  );
}
