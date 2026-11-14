"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { Eyebrow } from "./ui";
import { gallery, galleryCopy, type GalleryItem } from "@/lib/content";

function Slide({ item, priority }: { item: GalleryItem; priority?: boolean }) {
  if (item.video) {
    return <video src={item.video} className="h-full w-full object-cover" controls playsInline preload="metadata" aria-label={item.title} />;
  }
  if (item.image) {
    return <Image src={item.image} alt={item.alt} fill sizes="100vw" priority={priority} className="object-cover" />;
  }
  return null;
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Gallery() {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const openViewer = () => {
    opener.current = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
  };
  const total = gallery.length;

  const go = useCallback((d: number) => setIndex((i) => (i + d + total) % total), [total]);

  // Arrow keys only while the fullscreen viewer is open
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const current = gallery[index];
  const credit = current.credit;

  const ctrl =
    "inline-flex size-12 items-center justify-center border border-ivory/20 text-ivory transition-colors duration-[180ms] ease-(--ease-standard) hover:border-gold hover:text-gold";

  return (
    <section id="gallery" aria-labelledby="gal-title" className="bg-deep text-ivory">
      <div className="mx-auto max-w-[1440px] px-5 pt-24 md:px-10 md:pt-32 lg:px-16 lg:pt-40">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>{galleryCopy.eyebrow}</Eyebrow>
            <h2 id="gal-title" data-reveal className="mt-7 font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.95] font-normal">
              {galleryCopy.title}
              <br />
              <em className="text-gold-soft">{galleryCopy.em}</em>
            </h2>
          </div>
          <div data-reveal className="flex items-center gap-3">
            <button type="button" className={ctrl} onClick={() => go(-1)} aria-label="Previous image">
              <ArrowLeft className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <button type="button" className={ctrl} onClick={() => go(1)} aria-label="Next image">
              <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <button type="button" className={ctrl} onClick={openViewer} aria-label="View fullscreen">
              <Expand className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1440px] md:px-10 lg:px-16">
        <div
          data-reveal-img
          className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] md:aspect-[21/10]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-roledescription="carousel"
          aria-label="Project gallery"
        >
          {gallery.map((item, i) => (
            <div
              key={item.title}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-[opacity,transform] duration-[1400ms] ease-(--ease-lux) ${
                i === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0"
              }`}
            >
              <Slide item={item} priority={i === 0} />
            </div>
          ))}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 px-5 pb-6 md:px-10 md:pb-10" aria-live="polite">
            <div>
              <p className="text-[11px] tracking-[0.24em] text-gold uppercase">
                {pad(index + 1)} / {pad(total)}
                <span className="text-ivory/70"> · Prayagraj</span>
              </p>
              <p className="mt-2 font-serif text-3xl md:text-5xl">{current.title}</p>
              <p className="mt-2 text-sm text-ivory/75">{current.caption}</p>
              {credit && (
                <a href={credit.url} target="_blank" rel="noopener noreferrer license" className="mt-2 inline-block text-[11px] tracking-[0.08em] text-ivory/60 hover:text-gold hover:underline">
                  Photo: {credit.author} · {credit.licence}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail index */}
        <ul className="mt-6 grid grid-cols-2 gap-px px-5 pb-24 sm:grid-cols-5 md:px-0 md:pb-32 lg:pb-40">
          {gallery.map((item, i) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                className={`w-full border-t py-4 text-left text-[10px] tracking-[0.2em] uppercase transition-colors duration-500 md:text-[11px] ${
                  i === index ? "border-gold text-ivory" : "border-ivory/15 text-ivory/55 hover:text-ivory"
                }`}
              >
                <span className="text-gold">{pad(i + 1)}</span> {item.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        ref={dialog}
        aria-label="Gallery viewer"
        onClose={() => opener.current?.focus()}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-black p-0 text-ivory backdrop:bg-black"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative h-full w-full">
          <Slide item={current} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-5 md:p-8">
            <p className="text-[11px] tracking-[0.24em] uppercase">
              <span className="text-gold">{pad(index + 1)} / {pad(total)}</span> · {current.title}
              {credit && ` · Photo: ${credit.author} (${credit.licence})`}
            </p>
            <button type="button" className={ctrl} onClick={() => dialog.current?.close()} aria-label="Close viewer">
              <X className="size-5" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 p-6">
            <button type="button" className={ctrl} onClick={() => go(-1)} aria-label="Previous image">
              <ArrowLeft className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
            <button type="button" className={ctrl} onClick={() => go(1)} aria-label="Next image">
              <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden />
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
