import Image from "next/image";
import { asset } from "@/lib/asset";

type Props = { size?: "sm" | "lg"; className?: string };

/**
 * Brand lockup rebuilt from the supplied logo: original gold emblem + typeset wordmark,
 * with the corrected "By Vinayak Realty" line. For dark backgrounds only.
 * Replace with the designer's corrected master file (SVG) when available.
 */
export default function Logo({ size = "lg", className = "" }: Props) {
  const lg = size === "lg";
  return (
    <div role="img" aria-label="The Summit by Vinayak Realty" className={`inline-flex flex-col items-center ${className}`}>
      <Image
        src={asset("/brand/summit-emblem-transparent.png")}
        alt=""
        width={390}
        height={197}
        className={lg ? "h-20 w-auto md:h-28" : "h-10 w-auto"}
      />
      <span
        aria-hidden
        className={`bg-gradient-to-r from-[#c19d68] via-[#f4e4c4] to-[#d1b182] bg-clip-text font-serif leading-none text-transparent ${
          lg ? "mt-3 text-[clamp(2.5rem,9vw,5.5rem)] tracking-[0.08em]" : "mt-1.5 text-2xl tracking-[0.08em]"
        }`}
      >
        <span className={`block text-center ${lg ? "text-[0.42em] tracking-[0.2em]" : "text-[0.5em] tracking-[0.2em]"}`}>THE</span>
        SUMMIT
      </span>
      <span
        aria-hidden
        className={`flex items-center gap-3 font-sans font-semibold text-gold ${lg ? "mt-4 text-[11px] tracking-[0.32em] md:text-xs" : "mt-2 text-[8px] tracking-[0.28em]"}`}
      >
        <span className="flex items-center">
          <span className="size-1 rotate-45 bg-gold" />
          <span className={`h-px bg-gold ${lg ? "w-8 md:w-12" : "w-4"}`} />
        </span>
        BY VINAYAK REALTY
        <span className="flex items-center">
          <span className={`h-px bg-gold ${lg ? "w-8 md:w-12" : "w-4"}`} />
          <span className="size-1 rotate-45 bg-gold" />
        </span>
      </span>
    </div>
  );
}
