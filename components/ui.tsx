import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type Tone = "dark" | "light";

/** Signature element: 40px gold line + spaced uppercase label */
export function Eyebrow({ children, tone = "dark", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  const c = tone === "dark" ? "text-gold" : "text-bronze-deep";
  const line = tone === "dark" ? "bg-gold" : "bg-bronze";
  return (
    <p data-reveal className={`flex items-center gap-4 text-[11px] font-medium tracking-[0.32em] uppercase ${c} ${className}`}>
      <span aria-hidden className={`block h-px w-10 ${line}`} />
      {children}
    </p>
  );
}

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "line";
  tone?: Tone;
  arrow?: boolean;
  external?: boolean;
  className?: string;
};

export function ButtonLink({ href, children, variant = "solid", tone = "dark", arrow, external, className = "" }: BtnProps) {
  const base =
    "group inline-flex min-h-12 items-center gap-3 text-[11px] font-semibold tracking-[0.24em] uppercase transition-colors duration-[180ms] ease-(--ease-standard) md:min-h-11";
  const styles = {
    solid:
      tone === "dark"
        ? "bg-gold px-7 py-4 text-obsidian hover:bg-gold-soft"
        : "bg-espresso px-7 py-4 text-cream hover:bg-bronze-deep",
    outline:
      tone === "dark"
        ? "border border-ivory/25 px-7 py-4 text-ivory hover:border-gold hover:text-gold-soft"
        : "border border-espresso/30 px-7 py-4 text-espresso hover:border-bronze hover:text-bronze-deep",
    line:
      tone === "dark"
        ? "border-b border-gold/60 pb-2 text-ivory hover:border-gold hover:text-gold-soft"
        : "border-b border-bronze pb-2 text-espresso hover:text-bronze-deep",
  }[variant];
  return (
    <a
      href={href}
      className={`${base} ${styles} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {arrow && (
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-500 ease-(--ease-lux) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          strokeWidth={1.25}
        />
      )}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  );
}

export function ConceptTag({ tone = "dark", children = "Conceptual visual" }: { tone?: Tone; children?: ReactNode }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-4 left-4 z-10 text-[10px] tracking-[0.24em] uppercase ${
        tone === "dark" ? "text-ivory/70" : "text-espresso/70"
      }`}
    >
      {children}
    </span>
  );
}
