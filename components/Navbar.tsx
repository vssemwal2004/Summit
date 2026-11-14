"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { brand, nav } from "@/lib/content";
import { asset } from "@/lib/asset";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = () => {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
  };
  const close = () => dialogRef.current?.close();

  return (
    <header
      data-hero="fade"
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color,height] duration-700 ease-(--ease-lux) ${
        scrolled
          ? "h-[72px] border-b border-gold/15 bg-obsidian/92 backdrop-blur-xl"
          : "h-[88px] border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-16">
        <a href="#top" className="flex min-h-12 items-center gap-3 text-ivory" aria-label={`${brand.name} ${brand.by} — back to top`}>
          <Image src={asset("/brand/summit-emblem-transparent.png")} alt="" width={390} height={197} priority className="h-7 w-auto md:h-8" />
          <span className="font-serif text-lg tracking-[0.3em] md:text-xl">THE SUMMIT</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-10">
            {nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-line pb-1 text-[11px] tracking-[0.24em] text-ivory/85 uppercase hover:text-ivory">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#enquire"
            className="hidden min-h-11 items-center border border-gold/50 px-6 text-[11px] font-medium tracking-[0.24em] text-gold uppercase transition-colors duration-[180ms] ease-(--ease-standard) hover:border-gold hover:bg-gold hover:text-obsidian sm:inline-flex"
          >
            Enquire now
          </a>
          <button
            type="button"
            ref={openerRef}
            onClick={open}
            className="inline-flex size-12 items-center justify-center text-ivory lg:hidden"
            aria-label="Open menu"
            aria-haspopup="dialog"
          >
            <Menu strokeWidth={1.25} className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => {
          document.body.style.overflow = "";
          openerRef.current?.focus(); // return focus to the menu button
        }}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-full max-w-none bg-obsidian p-0 text-ivory backdrop:bg-obsidian"
      >
        <div className="flex h-full flex-col px-5 pt-6 pb-10">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3">
              <Image src={asset("/brand/summit-emblem-transparent.png")} alt="" width={390} height={197} className="h-7 w-auto" />
              <span className="font-serif text-lg tracking-[0.3em]">THE SUMMIT</span>
            </span>
            <button type="button" onClick={close} className="inline-flex size-12 items-center justify-center" aria-label="Close menu">
              <X strokeWidth={1.25} className="size-6" aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-16 flex-1">
            <ul className="flex flex-col">
              {nav.map((l, i) => (
                <li key={l.href} className="border-b border-ivory/10">
                  <a href={l.href} onClick={close} className="flex items-baseline gap-5 py-5 font-serif text-4xl">
                    <span className="font-sans text-xs tracking-[0.2em] text-gold">0{i + 1}</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="#enquire"
            onClick={close}
            className="inline-flex min-h-12 items-center justify-center bg-gold text-[11px] font-semibold tracking-[0.24em] text-obsidian uppercase"
          >
            Enquire now
          </a>
        </div>
      </dialog>
    </header>
  );
}
