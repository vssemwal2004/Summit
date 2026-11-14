"use client";

import { useRef, useState } from "react";
import { Eyebrow } from "./ui";
import { contact } from "@/lib/content";
import { submitEnquiry, type Enquiry as EnquiryData, type Interest } from "@/lib/submitEnquiry";

type Field = "name" | "phone" | "email" | "interest" | "consent";
type Errors = Partial<Record<Field, string>>;

const interests: { value: Interest; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "general", label: "General enquiry" },
];

const fieldLabels: Record<Field, string> = {
  name: "Full name",
  phone: "Phone number",
  email: "Email address",
  interest: "Interested in",
  consent: "Consent",
};

function read(form: HTMLFormElement): EnquiryData {
  const fd = new FormData(form);
  return {
    name: String(fd.get("name") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    interest: String(fd.get("interest") ?? "") as Interest,
    message: String(fd.get("message") ?? "").trim(),
    consent: fd.get("consent") === "on",
  };
}

function validate(d: EnquiryData): Errors {
  const e: Errors = {};
  if (d.name.length < 2) e.name = "Enter your full name.";
  if (!/^\+?[0-9\s-]{10,15}$/.test(d.phone)) e.phone = "Enter a phone number of 10–15 digits, e.g. +91 98765 43210.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Enter an email address like name@example.com.";
  if (!d.interest) e.interest = "Choose what you are interested in.";
  if (!d.consent) e.consent = "Confirm consent so the team can contact you.";
  return e;
}

const field =
  "w-full border-0 border-b border-ivory/40 bg-transparent px-0 py-3 text-base text-ivory transition-colors duration-[180ms] ease-(--ease-standard) focus:border-gold focus:outline-none aria-[invalid=true]:border-[#f0a597]";
const labelCls = "text-[11px] tracking-[0.22em] text-muted uppercase";
const helpCls = "mt-2 text-xs text-ivory/60";

/**
 * Form behaviour follows the AssetDesk rules: visible labels, helper text before errors,
 * validate on blur and on submit, keep values after an error, focus an error summary on
 * invalid submit, inline busy state that can't double-submit, status region for the result.
 */
export default function Enquiry() {
  const [errors, setErrors] = useState<Errors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const touched = useRef<Set<Field>>(new Set());
  const summaryRef = useRef<HTMLDivElement>(null);

  function onBlur(e: React.FocusEvent<HTMLFormElement>) {
    const name = ((e.target as EventTarget & { name?: string }).name ?? "") as Field;
    if (!(name in fieldLabels)) return;
    touched.current.add(name);
    const all = validate(read(e.currentTarget));
    setErrors((prev) => {
      const next = { ...prev };
      touched.current.forEach((f) => {
        if (all[f]) next[f] = all[f];
        else delete next[f];
      });
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const data = read(e.currentTarget);
    const err = validate(data);
    (Object.keys(fieldLabels) as Field[]).forEach((f) => touched.current.add(f));
    setErrors(err);

    if (Object.keys(err).length) {
      setShowSummary(true);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setShowSummary(false);
    setStatus("sending");
    const res = await submitEnquiry(data);
    setStatus(res.ok ? "done" : "idle");
  }

  const errText = (k: Field) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-2 text-xs text-[#f0a597]">
        <span className="sr-only">Error: </span>
        {errors[k]}
      </p>
    ) : null;
  const describedBy = (k: Field, help?: boolean) =>
    [help ? `${k}-help` : "", errors[k] ? `${k}-error` : ""].filter(Boolean).join(" ") || undefined;

  const errorList = (Object.keys(errors) as Field[]).filter((k) => errors[k]);

  return (
    <section id="enquire" aria-labelledby="enq-title" className="bg-obsidian text-ivory">
      <div className="mx-auto grid max-w-[1440px] gap-16 px-5 py-24 md:grid-cols-12 md:gap-6 md:px-10 md:py-32 lg:px-16 lg:py-40">
        <div className="md:col-span-5">
          <Eyebrow>Your invitation to something extraordinary</Eyebrow>
          <h2 id="enq-title" data-reveal className="mt-7 font-serif text-[clamp(3rem,6.5vw,5.75rem)] leading-[0.95] font-normal">
            The future
            <br />
            <em className="text-gold-soft">has an address.</em>
          </h2>
          <p data-reveal className="mt-8 max-w-md text-base leading-[1.8] text-muted">
            Discover the vision behind The Summit and register your interest in a new expression of luxury in Prayagraj.
          </p>
          <dl data-reveal className="mt-12 grid gap-5 border-t border-gold/30 pt-8 text-sm">
            <div>
              <dt className={labelCls}>Office</dt>
              <dd className="m-0 mt-1 text-ivory/90">{contact.office}</dd>
            </div>
            <div>
              <dt className={labelCls}>Phone</dt>
              <dd className="m-0 mt-1 text-ivory/90">{contact.phone}</dd>
            </div>
            <div>
              <dt className={labelCls}>Email</dt>
              <dd className="m-0 mt-1 text-ivory/90">{contact.email}</dd>
            </div>
          </dl>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          {status === "done" ? (
            <div role="status" className="border border-gold/40 bg-charcoal p-8 md:p-12">
              <p className="text-[11px] tracking-[0.24em] text-gold uppercase">Thank you</p>
              <p className="mt-4 font-serif text-4xl">Your interest has been noted.</p>
              <p className="mt-6 text-sm leading-relaxed text-muted">
                Demo only: this form is not yet connected to a backend, so no details were sent or stored. Please contact the team directly
                until online enquiries are enabled.
              </p>
              <button
                type="button"
                onClick={() => {
                  touched.current.clear();
                  setErrors({});
                  setStatus("idle");
                }}
                className="mt-8 min-h-12 border-b border-gold/60 text-[11px] tracking-[0.24em] uppercase hover:text-gold-soft"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={onSubmit}
              onBlur={onBlur}
              className="flex flex-col gap-8 border border-gold/25 bg-charcoal/70 p-6 sm:p-10 md:p-12"
              aria-describedby="form-note"
            >
              {showSummary && errorList.length > 0 && (
                <div ref={summaryRef} tabIndex={-1} role="alert" className="border border-[#f0a597]/60 bg-[#f0a597]/[0.06] p-5 focus:outline-2">
                  <p className="text-sm font-semibold">Please check {errorList.length === 1 ? "1 field" : `${errorList.length} fields`}:</p>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                    {errorList.map((k) => (
                      <li key={k}>
                        <a href={`#${k === "interest" ? "interest-residential" : k}`} className="text-[#f0a597] underline underline-offset-4">
                          {fieldLabels[k]}: {errors[k]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-ivory/60">All fields are required unless marked optional.</p>

              <div>
                <label htmlFor="name" className={labelCls}>
                  Full name
                </label>
                <input id="name" name="name" type="text" autoComplete="name" required className={field} aria-invalid={!!errors.name || undefined} aria-describedby={describedBy("name")} />
                {errText("name")}
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className={labelCls}>
                    Phone number
                  </label>
                  <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={field} aria-invalid={!!errors.phone || undefined} aria-describedby={describedBy("phone", true)} />
                  <p id="phone-help" className={helpCls}>Include country code if outside India.</p>
                  {errText("phone")}
                </div>
                <div>
                  <label htmlFor="email" className={labelCls}>
                    Email address
                  </label>
                  <input id="email" name="email" type="email" autoComplete="email" required className={field} aria-invalid={!!errors.email || undefined} aria-describedby={describedBy("email")} />
                  {errText("email")}
                </div>
              </div>

              <fieldset aria-describedby={describedBy("interest")}>
                <legend className={labelCls}>Interested in</legend>
                <div className="mt-4 flex flex-wrap gap-3">
                  {interests.map((o) => (
                    <label
                      key={o.value}
                      className="relative inline-flex min-h-12 cursor-pointer items-center border border-ivory/40 px-5 text-xs tracking-[0.16em] uppercase transition-colors duration-[180ms] ease-(--ease-standard) has-checked:border-gold has-checked:bg-gold has-checked:text-obsidian has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold hover:border-gold md:min-h-11"
                    >
                      <input id={`interest-${o.value}`} type="radio" name="interest" value={o.value} className="sr-only" />
                      {o.label}
                    </label>
                  ))}
                </div>
                {errText("interest")}
              </fieldset>

              <div>
                <label htmlFor="message" className={labelCls}>
                  Message <span className="tracking-normal normal-case">(optional)</span>
                </label>
                <textarea id="message" name="message" rows={3} className={`${field} resize-none`} />
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ivory/80">
                  <input
                    id="consent"
                    type="checkbox"
                    name="consent"
                    className="mt-1 size-5 shrink-0 accent-gold"
                    aria-invalid={!!errors.consent || undefined}
                    aria-describedby={describedBy("consent")}
                  />
                  I agree to be contacted by Vinayak Realty about The Summit by phone, email or WhatsApp. My details will be used only for
                  this enquiry and not shared with third parties.
                </label>
                {errText("consent")}
              </div>

              <button
                type="submit"
                aria-disabled={status === "sending"}
                className="inline-flex min-h-14 items-center justify-center gap-3 border border-gold text-[11px] font-semibold tracking-[0.24em] text-gold uppercase transition-colors duration-[180ms] ease-(--ease-standard) hover:bg-gold hover:text-obsidian aria-disabled:cursor-wait aria-disabled:opacity-60"
              >
                {status === "sending" && <span aria-hidden className="size-3.5 animate-spin rounded-full border border-current border-t-transparent motion-reduce:animate-none" />}
                {status === "sending" ? "Sending…" : "Request a private consultation ↗"}
              </button>
              <p id="form-note" className="text-xs leading-relaxed text-muted">
                Note: online enquiries are not yet connected. Submitting this form will not send your details anywhere.
              </p>
              <p className="sr-only" role="status" aria-live="polite">
                {status === "sending" ? "Sending your enquiry" : ""}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
