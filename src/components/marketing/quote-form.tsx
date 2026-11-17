"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useSiteLinks } from "@/components/site-provider";
import { IconWhatsApp, IconMail, IconInfo } from "@/components/icons";
import { saveQuoteRequest } from "@/app/(marketing)/quote/actions";

const CUSTOMER_TYPES = ["Home", "Office", "Business", "Industrial"] as const;
const SERVICES = [
  "Solar system (panels + inverter + battery)",
  "Inverter & battery backup",
  "CCTV & security",
  "Products only (no installation)",
  "Installation of equipment I already have",
  "Maintenance / repair",
] as const;

const input =
  "h-12 w-full rounded-xl border border-hair bg-white px-3.5 text-[0.95rem] text-ink outline-none transition-colors focus:border-blue focus:ring-3 focus:ring-blue/15 aria-invalid:border-red";
const labelText = "mb-1.5 block text-[0.82rem] font-semibold text-ink";

interface QuoteFormProps {
  initialMessage?: string;
}

/**
 * Quote request form. With no backend inbox yet, a valid submission is
 * handed to WhatsApp (primary) or email (fallback), pre-written — so the
 * request genuinely reaches Tobecat instead of disappearing into a mock.
 */
export function QuoteForm({ initialMessage = "" }: QuoteFormProps) {
  const { whatsappHref, mailtoHref } = useSiteLinks();
  const [values, setValues] = useState({ name: "", phone: "", email: "", location: "", type: "Home", message: initialMessage });
  const [services, setServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [composed, setComposed] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [trap, setTrap] = useState("");

  /** Save for the admin inbox (alongside WhatsApp/email — never blocks them). */
  function store() {
    saveQuoteRequest({
      kind: "standard",
      name: values.name,
      phone: values.phone,
      email: values.email,
      location: values.location,
      customerType: values.type,
      services,
      message: values.message,
      website: trap,
    })
      .then((r) => setSaved(r.reference ?? null))
      .catch(() => {});
  }

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function validate() {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Please enter your name.";
    if (values.phone.replace(/\D/g, "").length < 10) next.phone = "Please enter a valid phone number.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) next.email = "That email address doesn't look right.";
    if (!values.location.trim()) next.location = "Please tell us where the installation or delivery is.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function compose() {
    return [
      "Quote request from tobecat.com",
      "",
      `Name: ${values.name.trim()}`,
      `Phone: ${values.phone.trim()}`,
      ...(values.email.trim() ? [`Email: ${values.email.trim()}`] : []),
      `Location: ${values.location.trim()}`,
      `For: ${values.type}`,
      ...(services.length ? [`Interested in: ${services.join("; ")}`] : []),
      ...(values.message.trim() ? ["", values.message.trim()] : []),
    ].join("\n");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) {
      const first = e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    const text = compose();
    setComposed(text);
    window.open(whatsappHref(text), "_blank", "noopener,noreferrer");
    store();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative rounded-3xl border border-hair bg-white p-5 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-8">
      {/* spam trap: hidden from people, filled in by bots */}
      <input type="text" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelText}>Full name *</span>
          <input value={values.name} onChange={set("name")} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby="err-name" className={input} />
          {errors.name && <span id="err-name" className="mt-1 block text-[0.78rem] text-red-dark">{errors.name}</span>}
        </label>
        <label className="block">
          <span className={labelText}>Phone / WhatsApp *</span>
          <input value={values.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} aria-describedby="err-phone" className={input} />
          {errors.phone && <span id="err-phone" className="mt-1 block text-[0.78rem] text-red-dark">{errors.phone}</span>}
        </label>
        <label className="block">
          <span className={labelText}>Email (optional)</span>
          <input value={values.email} onChange={set("email")} type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby="err-email" className={input} />
          {errors.email && <span id="err-email" className="mt-1 block text-[0.78rem] text-red-dark">{errors.email}</span>}
        </label>
        <label className="block">
          <span className={labelText}>City / State *</span>
          <input value={values.location} onChange={set("location")} autoComplete="address-level2" placeholder="e.g. Lekki, Lagos" aria-invalid={Boolean(errors.location)} aria-describedby="err-location" className={input} />
          {errors.location && <span id="err-location" className="mt-1 block text-[0.78rem] text-red-dark">{errors.location}</span>}
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className={labelText}>This is for a…</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CUSTOMER_TYPES.map((t) => (
            <label
              key={t}
              className={cn(
                "flex h-11 cursor-pointer items-center justify-center rounded-xl border-[1.5px] font-heading text-[0.88rem] font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-blue/25",
                values.type === t ? "border-blue bg-blue text-white" : "border-hair text-slate hover:border-blue",
              )}
            >
              <input type="radio" name="type" value={t} checked={values.type === t} onChange={set("type")} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className={labelText}>What do you need? (choose any)</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SERVICES.map((s) => {
            const checked = services.includes(s);
            return (
              <label key={s} className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[0.88rem] transition-colors", checked ? "border-blue bg-mist" : "border-hair hover:border-[#c9d8f2]")}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setServices((prev) => (checked ? prev.filter((x) => x !== s) : [...prev, s]))}
                  className="mt-0.5 size-4 accent-[var(--color-blue)]"
                />
                <span className="text-ink">{s}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className={labelText}>Details</span>
        <textarea
          value={values.message}
          onChange={set("message")}
          rows={initialMessage ? 12 : 5}
          placeholder="What would you like to power? Any products you're interested in?"
          className="w-full rounded-xl border border-hair bg-white px-3.5 py-3 font-mono text-[0.84rem] leading-relaxed text-ink outline-none focus:border-blue focus:ring-3 focus:ring-blue/15"
        />
      </label>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-7 font-heading text-[0.95rem] font-semibold text-white transition-transform hover:-translate-y-0.5">
          <IconWhatsApp className="size-[18px]" />
          Send Request on WhatsApp
        </button>
        <button
          type="button"
          onClick={() => {
            if (!validate()) return;
            const text = compose();
            setComposed(text);
            store();
            window.location.href = mailtoHref(`Quote request — ${values.name.trim()}`, text);
          }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#c9d8f2] px-7 font-heading text-[0.92rem] font-semibold text-blue transition-colors hover:border-blue"
        >
          <IconMail className="size-4" />
          Send by Email Instead
        </button>
      </div>

      <p className="mt-4 flex gap-2 text-[0.78rem] leading-snug text-slate">
        <IconInfo className="mt-px size-4 shrink-0" />
        Your request opens in WhatsApp (or your email app) ready to send — just press send. We also keep a copy so
        our team can follow up.
      </p>

      {composed && (
        <div role="status" className="mt-4 rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-4 py-3 text-[0.86rem] text-[#17733b]">
          Your request is ready. If WhatsApp didn&rsquo;t open,{" "}
          <a href={whatsappHref(composed)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            tap here to send it
          </a>
          .
          {saved && <span className="mt-1 block font-semibold">Saved as {saved} — our team has a copy too.</span>}
        </div>
      )}
    </form>
  );
}
