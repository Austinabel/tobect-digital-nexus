/**
 * Editable page content (table `page_content`, Admin → Pages).
 *
 * Each page is described by a schema of plain fields and lists. The same
 * schema drives the admin editor, the server-side validation and the
 * defaults (what the site shipped with), so nothing is free-form HTML and
 * a bad value can never break a page. Pure and unit-tested.
 */

import { APPLIANCE_LIBRARY } from "./calculator";
import { slugify } from "./admin/product-form";

export type ContentKey = "about" | "faqs" | "testimonials" | "projects" | "warranty" | "terms" | "privacy" | "returns" | "delivery" | "calculator";

export interface ScalarField {
  key: string;
  label: string;
  /** "id": hidden, kept stable for existing rows and made from the row's name for new ones */
  kind: "text" | "textarea" | "richtext" | "image" | "number" | "checkbox" | "id";
  max?: number;
  required?: boolean;
  hint?: string;
  /** number fields */
  min?: number;
  maxValue?: number;
  /** number fields: allow decimals (e.g. 0.5 hours) */
  decimals?: boolean;
  /** id fields: the field whose text the id is made from */
  from?: string;
}
export interface ListField {
  key: string;
  label: string;
  kind: "list";
  itemLabel: string;
  maxItems: number;
  minItems?: number;
  hint?: string;
  fields: ScalarField[];
  /** cross-field check on one row; returns { field: message } */
  rowRule?: (row: Record<string, unknown>) => Record<string, string>;
}
export type Field = ScalarField | ListField;

export interface ContentSchema {
  key: ContentKey;
  title: string;
  intro: string;
  group: "Company" | "Policies" | "Calculator";
  /** who may edit it (default: content.manage) */
  permission?: "content.manage" | "calculator.manage";
  /** the public page, for "View page" */
  path: string;
  fields: Field[];
}

const RICH_HINT = "Blank line = new paragraph · “## ” heading · “- ” bullet · “1. ” numbered · **bold** · [link text](/page) · {email} {phone} {whatsapp} {legalName} {shortName} {hours} {branches} fill in your details.";

const policy = (key: ContentKey, title: string, path: string, intro: string): ContentSchema => ({
  key,
  title,
  path,
  group: "Policies",
  intro,
  fields: [
    { key: "title", label: "Page title", kind: "text", max: 80, required: true },
    { key: "summary", label: "Search engine description", kind: "textarea", max: 300, hint: "One or two sentences shown in Google results." },
    { key: "body", label: "Policy text", kind: "richtext", max: 20000, hint: RICH_HINT },
  ],
});

export const CONTENT_SCHEMAS: Record<ContentKey, ContentSchema> = {
  about: {
    key: "about",
    title: "About page",
    path: "/about",
    group: "Company",
    intro: "Your story and credentials. Each section stays hidden until it has content — only real facts and figures belong here.",
    fields: [
      { key: "founded", label: "Year founded", kind: "text", max: 4, hint: "e.g. 2019" },
      { key: "experience", label: "Experience", kind: "text", max: 40, hint: "In your words, e.g. “5 years”" },
      { key: "cacNumber", label: "CAC registration number", kind: "text", max: 20 },
      { key: "story", label: "Our story", kind: "textarea", max: 4000, hint: "Leave a blank line between paragraphs." },
      { key: "mission", label: "Mission", kind: "textarea", max: 400 },
      { key: "vision", label: "Vision", kind: "textarea", max: 400 },
      {
        key: "stats",
        label: "Figures",
        kind: "list",
        itemLabel: "figure",
        maxItems: 6,
        hint: "Verified numbers only, e.g. “500+” solar systems installed.",
        fields: [
          { key: "value", label: "Number", kind: "text", max: 12, required: true },
          { key: "label", label: "What it counts", kind: "text", max: 60, required: true },
        ],
      },
      {
        key: "milestones",
        label: "Milestones",
        kind: "list",
        itemLabel: "milestone",
        maxItems: 12,
        fields: [
          { key: "year", label: "Year", kind: "text", max: 10, required: true },
          { key: "title", label: "What happened", kind: "text", max: 100, required: true },
          { key: "text", label: "Details", kind: "textarea", max: 300 },
        ],
      },
      {
        key: "certifications",
        label: "Registrations & certifications",
        kind: "list",
        itemLabel: "certification",
        maxItems: 10,
        fields: [
          { key: "name", label: "Name", kind: "text", max: 120, required: true },
          { key: "detail", label: "Detail", kind: "text", max: 120, hint: "e.g. registration number or issuing body" },
        ],
      },
      {
        key: "team",
        label: "Team",
        kind: "list",
        itemLabel: "person",
        maxItems: 16,
        hint: "Real staff only, with their permission.",
        fields: [
          { key: "name", label: "Name", kind: "text", max: 80, required: true },
          { key: "role", label: "Role", kind: "text", max: 80, required: true },
          { key: "bio", label: "Short bio", kind: "textarea", max: 300 },
          { key: "photo", label: "Photo", kind: "image" },
        ],
      },
    ],
  },
  projects: {
    key: "projects",
    title: "Projects",
    path: "/",
    group: "Company",
    intro: "Installations you've completed. Shown on the homepage once you add one (the Projects page is switched off for now). Real projects and photos only.",
    fields: [
      {
        key: "items",
        label: "Projects",
        kind: "list",
        itemLabel: "project",
        maxItems: 40,
        fields: [
          { key: "title", label: "Title", kind: "text", max: 100, required: true },
          { key: "location", label: "Location", kind: "text", max: 80, required: true },
          { key: "systemCapacity", label: "System", kind: "text", max: 40, required: true, hint: "e.g. 10 kVA hybrid" },
          { key: "inverter", label: "Inverter", kind: "text", max: 80 },
          { key: "battery", label: "Battery", kind: "text", max: 80 },
          { key: "panels", label: "Panels", kind: "text", max: 80 },
          { key: "description", label: "Description", kind: "textarea", max: 600, required: true },
          { key: "image", label: "Photo of the installation", kind: "image" },
        ],
      },
    ],
  },
  testimonials: {
    key: "testimonials",
    title: "Testimonials",
    path: "/",
    group: "Company",
    intro: "Customer reviews on the homepage (hidden while empty). Only genuine reviews, published with the customer's permission.",
    fields: [
      {
        key: "items",
        label: "Reviews",
        kind: "list",
        itemLabel: "review",
        maxItems: 20,
        fields: [
          { key: "name", label: "Customer name", kind: "text", max: 60, required: true, hint: "Or a display name they approved" },
          { key: "quote", label: "What they said", kind: "textarea", max: 600, required: true },
          { key: "purchase", label: "What they bought", kind: "text", max: 80 },
          { key: "location", label: "Location", kind: "text", max: 60 },
          { key: "rating", label: "Stars they gave (1–5)", kind: "number", min: 1, maxValue: 5, hint: "Leave empty if they didn't give a rating." },
          { key: "consent", label: "The customer agreed to this being published", kind: "checkbox", required: true },
        ],
      },
    ],
  },
  faqs: {
    key: "faqs",
    title: "FAQs",
    path: "/faq",
    group: "Company",
    intro: "Questions and answers on the FAQ page and the Support page.",
    fields: [
      {
        key: "items",
        label: "Questions",
        kind: "list",
        itemLabel: "question",
        maxItems: 30,
        fields: [
          { key: "q", label: "Question", kind: "text", max: 160, required: true },
          { key: "a", label: "Answer", kind: "richtext", max: 1500, required: true, hint: "Placeholders like {branches} and {phone} fill in your details." },
        ],
      },
    ],
  },
  calculator: {
    key: "calculator",
    title: "Calculator appliances",
    path: "/solar-calculator",
    group: "Calculator",
    permission: "calculator.manage",
    intro:
      "The appliances customers pick from in the solar calculators, with typical ratings. Customers can still change the watts and hours for their own appliances. The sizing rules (sun hours, efficiency, cable and protection factors) are engineering values and stay fixed.",
    fields: [
      {
        key: "appliances",
        label: "Appliances",
        kind: "list",
        itemLabel: "appliance",
        maxItems: 60,
        minItems: 1,
        hint: "Home, Office, Business and Industrial start with some of these; an appliance you remove is left out of them.",
        rowRule: (r): Record<string, string> =>
          typeof r.nightHours === "number" && typeof r.hoursPerDay === "number" && r.nightHours > r.hoursPerDay ? { nightHours: "Can't be more than the hours per day." } : {},
        fields: [
          { key: "id", label: "id", kind: "id", from: "name" },
          { key: "name", label: "Appliance", kind: "text", max: 60, required: true },
          { key: "watts", label: "Running watts (each)", kind: "number", min: 1, maxValue: 50000, required: true },
          { key: "hoursPerDay", label: "Typical hours per day", kind: "number", decimals: true, min: 0, maxValue: 24, required: true },
          { key: "nightHours", label: "Of which after dark", kind: "number", decimals: true, min: 0, maxValue: 24, hint: "Hours with no sunshine — used for night-time battery sizing." },
          { key: "surge", label: "Has a motor or compressor (start-up surge)", kind: "checkbox" },
        ],
      },
    ],
  },
  warranty: policy("warranty", "Warranty", "/warranty", "Warranty terms and how to make a claim."),
  returns: policy("returns", "Refund & returns policy", "/returns", "When customers can return items and how refunds are paid. Payment providers such as Paystack require this page."),
  delivery: policy("delivery", "Delivery policy", "/delivery", "Where you deliver, how long it takes and what it costs."),
  terms: policy("terms", "Terms of service", "/terms", "The terms that apply to orders on this website. Payment providers such as Paystack require this page."),
  privacy: policy("privacy", "Privacy policy", "/privacy", "What the website stores and how it is used. Keep it in step with what the site actually does."),
};

export const CONTENT_KEYS = Object.keys(CONTENT_SCHEMAS) as ContentKey[];

// ---------------------------------------------------------------------------
// What the site shipped with.

export const DEFAULT_CONTENT: Record<ContentKey, Record<string, unknown>> = {
  about: {
    founded: "",
    experience: "5 years",
    cacNumber: "8487955",
    story: "",
    mission: "",
    vision: "",
    stats: [],
    milestones: [],
    certifications: [{ name: "Registered with the Corporate Affairs Commission (CAC)", detail: "Registration No. 8487955" }],
    team: [],
  },
  projects: { items: [] },
  testimonials: { items: [] },
  calculator: { appliances: APPLIANCE_LIBRARY.map((a) => ({ id: a.id, name: a.name, watts: a.watts, hoursPerDay: a.hoursPerDay, nightHours: a.nightHours ?? null, surge: Boolean(a.surge) })) },
  faqs: {
    items: [
      {
        q: "How do I order?",
        a: "Add products to your cart and check out — with an account or as a guest — or [request a quote](/quote). You get an order number straight away, and our team then confirms availability, the final price, delivery cost and date with you before you pay.",
      },
      {
        q: "How can I pay?",
        a: "By bank transfer to the account we give you when we confirm your order, or by card through Paystack's secure checkout where that option is shown. Card details are entered on Paystack's page and never reach our website.",
      },
      { q: "Do I need an account to order?", a: "No. You can check out as a guest. An account lets you see your orders in [My account](/account), save your delivery details and save solar designs." },
      { q: "Do you deliver outside Lagos?", a: "Yes — we deliver to every state in Nigeria. Lagos orders usually arrive in 1–3 working days and other states in 3–7 working days after payment is confirmed. See our [Delivery Policy](/delivery)." },
      { q: "How much is delivery?", a: "It depends on your location and the size of the order. We tell you the exact cost before you pay — there are no hidden charges. Collection from our Lagos office or our {branches} branches is free." },
      { q: "Can I return an item?", a: "Yes. Unused items in their original packaging can be returned within 7 days of delivery. Items that arrive faulty, damaged or wrong are collected at our cost. See our [Refund & Returns Policy](/returns)." },
      { q: "How long do refunds take?", a: "Within 7 working days of us receiving and checking the returned item, paid back to your original payment method." },
      { q: "Do your products come with a warranty?", a: "Yes. Products carry the manufacturer's warranty, and we help you with any claim. See our [Warranty](/warranty) page." },
      { q: "Do you install solar systems?", a: "Yes. Our engineers survey your site, recommend the right system, install, commission and show you how to use it. Installation is quoted after the survey. [Book an installation](/installation)." },
      {
        q: "How accurate is the solar calculator?",
        a: "It gives a sensible starting estimate based on typical appliance ratings and Nigerian sunshine. Final sizing is always confirmed by our engineers, usually after a site assessment.",
      },
      { q: "Can you install equipment I bought elsewhere?", a: "Yes. [Request a quote](/quote) and tell us what equipment you have." },
      { q: "Do you supply installers and businesses in bulk?", a: "Yes. Use our [bulk quote form](/bulk-quote) to request one quotation for all the products and quantities you need." },
      { q: "How do I contact you?", a: "Call {phone}, WhatsApp {whatsapp} or email {email}. We're open {hours}." },
    ],
  },
  warranty: {
    title: "Warranty Information",
    summary: "How product warranties work for equipment bought from us, and how to make a claim.",
    body: [
      "## Manufacturer warranties",
      "Products we sell carry the manufacturer's warranty. Warranty length and terms differ by brand and product, so we confirm the exact warranty for each item when you buy.",
      "## What warranties don't cover",
      "- Damage from misuse, accidents, water, power surges or lightning.\n- Faults caused by installation, repair or modification by anyone other than us or the manufacturer's agents.\n- Normal wear, and batteries used outside the manufacturer's guidelines.",
      "## Making a claim",
      "1. Keep your receipt or invoice from {shortName}.\n2. Contact us on WhatsApp ({whatsapp}) or by email ({email}) with the product name, purchase date and a description — photos or video help.\n3. We'll guide you through the next steps with the manufacturer.",
      "Items that arrive faulty are covered by our [Refund & Returns Policy](/returns). Questions? Visit [Support](/support).",
    ].join("\n\n"),
  },
  returns: {
    title: "Refund & Returns Policy",
    summary: "Return unused items within 7 days of delivery. Faulty or wrong items are collected at our cost. Refunds within 7 working days to your original payment method.",
    body: [
      "We want you to be happy with your purchase. This policy explains when you can return an item and how refunds work.",
      "## Returns within 7 days",
      "You can return an item within **7 days of delivery or collection** if it is:\n- unused and in the same condition you received it;\n- in its original packaging, with all parts, manuals and accessories; and\n- returned with your receipt, invoice or order number.",
      "## Items that can't be returned",
      "- Items that have been installed, wired or connected. If an installed item develops a fault, we repair or replace it under the manufacturer's [warranty](/warranty).\n- Items damaged by misuse, accidents, power surges, or installation by others.",
      "## Faulty, damaged or wrong items",
      "If an item arrives faulty, damaged or different from what you ordered, tell us within 7 days of delivery and send photos or a video. We collect it at our cost and repair, replace or refund it — your choice where the item can't be repaired or replaced. Faults that appear later are handled under the manufacturer's [warranty](/warranty).",
      "## Return delivery",
      "For change-of-mind returns, you pay the cost of returning the item to our Lagos office or one of our branches ({branches}). We pay the return cost when the item was faulty, damaged or wrong.",
      "## How to return an item",
      "1. Contact us on WhatsApp ({whatsapp}), by phone ({phone}) or by email ({email}) with your order number and the reason for the return.\n2. We confirm the return and tell you where to send or bring the item.\n3. We check the item when it arrives and tell you the outcome.",
      "## Refunds",
      "- Once a return is approved, we refund you within **7 working days** of receiving and checking the item.\n- Refunds go back to your original payment method: card payments are refunded through Paystack, and bank transfers are paid back to your bank account.\n- Delivery fees are not refunded, unless the item was faulty, damaged or wrong.\n- If you cancel an order before it is dispatched, we refund everything you paid within 7 working days.",
      "Card refunds can take a few extra days to show, depending on your bank.",
      "## Questions",
      "Contact us at {email} or {phone}. This policy does not affect your rights under Nigerian consumer protection law.",
    ].join("\n\n"),
  },
  delivery: {
    title: "Delivery Policy",
    summary: "Nationwide delivery: Lagos in 1–3 working days, other states in 3–7 working days. Delivery cost confirmed before you pay. Free collection from our offices.",
    body: [
      "## Where we deliver",
      "We deliver to every state in Nigeria.",
      "## Delivery times",
      "- **Lagos:** 1–3 working days after your payment is confirmed.\n- **Other states:** 3–7 working days after your payment is confirmed.",
      "Large orders, items on pre-order and complete solar systems can take longer. We give you the expected delivery date when we confirm your order.",
      "## Delivery cost",
      "The cost depends on your location and the size and weight of your order. We tell you the exact cost before you pay — there are no hidden charges.",
      "## Free collection",
      "You can collect your order free of charge from our Lagos office ({address}) or from our branches in {branches}, once we tell you it is ready.",
      "## Receiving your order",
      "Please check your items when they arrive. If anything is damaged, missing or not what you ordered, tell us within 7 days — see our [Refund & Returns Policy](/returns). Someone aged 18 or over should be available to receive the delivery.",
      "## Installation",
      "If your order includes installation, our team agrees the installation date with you.",
      "## Questions",
      "See your orders in [My account](/account), or contact us on WhatsApp ({whatsapp}) or {phone}.",
    ].join("\n\n"),
  },
  terms: {
    title: "Terms of Service",
    summary: "The terms that apply when you buy products or installation services from us through this website.",
    body: [
      "These terms apply when you use this website or buy from {legalName} (“we”, “us”), a company registered in Nigeria with the Corporate Affairs Commission (RC 8487955), of {address}. By placing an order you agree to them. Our [Refund & Returns Policy](/returns), [Delivery Policy](/delivery), [Warranty](/warranty) and [Privacy Policy](/privacy) form part of these terms.",
      "## 1. What we sell",
      "We sell solar panels, inverters, lithium batteries, solar generators, CCTV and security equipment and related accessories, and we design, install and maintain solar and backup power systems for homes and businesses across Nigeria.",
      "## 2. Prices and product information",
      "- Prices are in Nigerian naira (₦). Delivery and installation are charged separately unless stated.\n- We work to keep prices, stock and specifications accurate. If we find an error, we tell you before you pay and you may cancel.\n- Some photos are illustrative. The specifications on the product page and in your order confirmation describe what you receive.",
      "## 3. Orders",
      "1. Placing an order on this website is an offer to buy. You receive an order number straight away.\n2. Our team confirms availability, the final price, any delivery cost and the delivery date with you by phone, WhatsApp or email.\n3. The contract is formed when we confirm your order. We may decline or cancel an order — for example if an item is unavailable or a price was wrong — and any payment you made is then refunded in full.",
      "## 4. Payment",
      "- You can pay by bank transfer to the account we give you when we confirm your order, or through Paystack where online payment is shown at checkout.\n- Card details are entered on Paystack's secure page and never reach our website.\n- Goods are released for delivery or collection once payment is confirmed.",
      "## 5. Delivery and collection",
      "We deliver across Nigeria, and you can collect from our Lagos office or our {branches} branches. Timelines and costs are explained in our [Delivery Policy](/delivery). Responsibility for the goods passes to you when they are delivered or collected.",
      "## 6. Installation",
      "Installation is quoted separately after a site survey unless it is included in your quote. Our engineers install to the agreed design; you agree to give safe access to the site and to tell us about anything that may affect the work. Results from the website's solar calculator are estimates, not an engineering design — the final system size is confirmed by our engineers.",
      "## 7. Cancellations, returns and refunds",
      "You may cancel an order before it is dispatched and receive a full refund. Returns and refunds after delivery are covered by our [Refund & Returns Policy](/returns).",
      "## 8. Warranty",
      "Products carry the manufacturer's warranty. See our [Warranty](/warranty) page for what it covers and how to make a claim.",
      "## 9. Your account",
      "If you create an account, keep your password private; you are responsible for orders placed with it. You can ask us to close your account at any time.",
      "## 10. Our responsibility to you",
      "We are responsible for loss or damage you suffer that is a foreseeable result of our breaking these terms or failing to use reasonable care and skill. We are not responsible for losses caused by misuse, by installation or repairs carried out by others, or by events outside our reasonable control. Nothing in these terms limits your rights under Nigerian consumer protection law, including the Federal Competition and Consumer Protection Act 2018.",
      "## 11. Changes and governing law",
      "We may update these terms from time to time; the version on this page when you place an order applies to that order. These terms are governed by the laws of the Federal Republic of Nigeria.",
      "## 12. Contact us",
      "{legalName}, {address}. Phone {phone} · WhatsApp {whatsapp} · Email {email}. Open {hours}.",
    ].join("\n\n"),
  },
  privacy: {
    title: "Privacy Policy",
    summary: "How we collect, use and protect your personal information when you use our website or buy from us.",
    body: [
      "This policy explains how {legalName} (“we”, “us”) collects and uses personal information through this website, in line with the Nigeria Data Protection Act 2023.",
      "## What we collect",
      "- **Your cart and saved items** — kept only in your own browser until you place an order.\n- **Account details**, if you create an account: your name, email, phone number, delivery address and any solar designs you save.\n- **Order details**: the items, prices, your contact and delivery details, and the payment status.\n- **Quote requests**: the details you enter in our quote and bulk-quote forms.\n- **Payments**: card payments are processed by Paystack on its secure page. We never see or store your card details; we receive only the payment reference and status.",
      "## How we use it",
      "Only to process and deliver your orders, prepare quotes, arrange installation and after-sales support, answer your questions, and meet our legal and accounting obligations. We do not sell your information, and we do not send you marketing messages without your consent.",
      "## Who we share it with",
      "- **Paystack**, to process online payments.\n- **Our database and website hosting providers** (including Supabase), who store data on our behalf.\n- **Delivery partners**, who receive only the name, phone number and address needed to deliver your order.\n- **Authorities**, where the law requires it.",
      "## Cookies and storage",
      "We use only essential cookies, to keep you signed in to your account, and your browser's local storage for your cart and saved items. We do not use advertising or tracking cookies.",
      "## How long we keep it",
      "We keep order and payment records for as long as required for accounting and tax purposes. You can ask us to delete your account at any time.",
      "## Your rights",
      "You can ask to see, correct or delete your personal information, or object to how we use it, by emailing {email}. You can also complain to the Nigeria Data Protection Commission.",
      "## Security",
      "Only authorised {shortName} staff can see customer information, each with their own login, and information is sent over encrypted (https) connections.",
      "## Contact",
      "{legalName}, {address}. Email {email} · Phone {phone}.",
    ].join("\n\n"),
  },
};

// ---------------------------------------------------------------------------
// Validation (admin save) and lenient reading (public pages).

export type ContentErrors = Record<string, string>;

const isHttps = (v: string) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

function parseScalar(f: ScalarField, raw: unknown, path: string, errors: ContentErrors, isLibraryUrl: (u: string) => boolean): unknown {
  switch (f.kind) {
    case "checkbox": {
      const v = raw === true || raw === "on" || raw === "true";
      if (f.required && !v) errors[path] = "Required — tick to confirm.";
      return v;
    }
    case "number": {
      if (raw === "" || raw === null || raw === undefined) {
        if (f.required) errors[path] = "Required.";
        return null;
      }
      const n = Number(raw);
      const okNumber = f.decimals ? Number.isFinite(n) : Number.isInteger(n);
      if (!okNumber || (f.min !== undefined && n < f.min) || (f.maxValue !== undefined && n > f.maxValue)) {
        errors[path] = `Enter a ${f.decimals ? "number" : "whole number"}${f.min !== undefined ? ` from ${f.min}` : ""}${f.maxValue !== undefined ? ` to ${f.maxValue}` : ""}.`;
        return null;
      }
      return f.decimals ? Math.round(n * 100) / 100 : n;
    }
    case "id": {
      const v = typeof raw === "string" ? raw.trim() : "";
      return /^[a-z0-9-]{1,60}$/.test(v) ? v : "";
    }
    case "image": {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) {
        if (f.required) errors[path] = "Choose an image.";
        return "";
      }
      if (!isHttps(v) || !isLibraryUrl(v)) {
        errors[path] = "Pick the image from the media library.";
        return "";
      }
      return v;
    }
    default: {
      const v = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : typeof raw === "number" ? String(raw) : "";
      const max = f.max ?? (f.kind === "text" ? 200 : 4000);
      if (v.length > max) errors[path] = `Too long — keep it under ${max} characters.`;
      if (!v && f.required) errors[path] = "Required.";
      return v.slice(0, max);
    }
  }
}

const isEmpty = (v: unknown) => v === "" || v === null || v === false || v === undefined;

/**
 * Clean a page's content. `strict` (admin save) reports every problem;
 * the public site calls it non-strict and simply drops what's invalid.
 */
export function parseContent(
  key: ContentKey,
  raw: unknown,
  opts: { isLibraryUrl?: (u: string) => boolean } = {},
): { value: Record<string, unknown>; errors: ContentErrors } {
  const schema = CONTENT_SCHEMAS[key];
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const errors: ContentErrors = {};
  const lib = opts.isLibraryUrl ?? isHttps;
  const value: Record<string, unknown> = {};
  for (const f of schema.fields) {
    if (f.kind !== "list") {
      value[f.key] = parseScalar(f, r[f.key], f.key, errors, lib);
      continue;
    }
    const rows = Array.isArray(r[f.key]) ? (r[f.key] as unknown[]) : [];
    const out: Record<string, unknown>[] = [];
    rows.forEach((row) => {
      const o = (row && typeof row === "object" ? row : {}) as Record<string, unknown>;
      // a row left completely blank is just ignored
      if (f.fields.every((sf) => isEmpty(typeof o[sf.key] === "string" ? (o[sf.key] as string).trim() : o[sf.key]))) return;
      const i = out.length;
      const item: Record<string, unknown> = {};
      for (const sf of f.fields) item[sf.key] = parseScalar(sf, o[sf.key], `${f.key}.${i}.${sf.key}`, errors, lib);
      for (const [k, msg] of Object.entries(f.rowRule?.(item) ?? {})) errors[`${f.key}.${i}.${k}`] = msg;
      out.push(item);
    });
    // ids: keep existing ones, make new ones from the row's name, never duplicate
    for (const sf of f.fields.filter((x) => x.kind === "id")) {
      const used = new Set<string>();
      for (const item of out) {
        let id = String(item[sf.key] ?? "") || slugify(String(item[sf.from ?? ""] ?? "")).slice(0, 50) || "item";
        const base = id;
        for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
        used.add(id);
        item[sf.key] = id;
      }
    }
    if (out.length > f.maxItems) errors[f.key] = `Up to ${f.maxItems} ${f.itemLabel}s.`;
    if (f.minItems && out.length < f.minItems) errors[f.key] = `Keep at least ${f.minItems} ${f.itemLabel}.`;
    value[f.key] = out.slice(0, f.maxItems);
  }
  return { value, errors };
}

/** Public reading: invalid rows are dropped rather than shown half-broken. */
export function readContent(key: ContentKey, raw: unknown): Record<string, unknown> {
  const { value, errors } = parseContent(key, raw ?? DEFAULT_CONTENT[key]);
  const bad = new Set(Object.keys(errors).filter((p) => p.includes(".")).map((p) => p.split(".").slice(0, 2).join(".")));
  for (const f of CONTENT_SCHEMAS[key].fields) {
    if (f.kind === "list") value[f.key] = (value[f.key] as unknown[]).filter((_, i) => !bad.has(`${f.key}.${i}`));
  }
  return value;
}

// ---------------------------------------------------------------------------
// Rich text: a small, safe subset of Markdown. Never HTML.

export type Inline = { t: "text"; v: string } | { t: "bold"; v: string } | { t: "link"; v: string; href: string } | { t: "token"; v: string };
export type Block = { t: "p"; c: Inline[] } | { t: "h2"; v: string } | { t: "ul"; items: Inline[][] } | { t: "ol"; items: Inline[][] };

export const TOKENS = ["email", "phone", "whatsapp", "legalName", "name", "shortName", "hours", "branches", "address"] as const;

/** Links may only go to a page on this site, an https page, email or phone. */
export function safeContentHref(href: string): string | null {
  const h = href.trim();
  if (h.startsWith("/") && !h.startsWith("//")) return h;
  if (/^mailto:[^\s@]+@[^\s@]+$/.test(h) || /^tel:\+?[\d\s-]{6,}$/.test(h)) return h;
  return isHttps(h) ? h : null;
}

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|\{([a-zA-Z]+)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const push = (v: string) => v && out.push({ t: "text", v });
  while ((m = re.exec(s))) {
    push(s.slice(last, m.index));
    if (m[1] !== undefined) out.push({ t: "bold", v: m[1] });
    else if (m[2] !== undefined) {
      const href = safeContentHref(m[3]);
      out.push(href ? { t: "link", v: m[2], href } : { t: "text", v: m[2] });
    } else if ((TOKENS as readonly string[]).includes(m[4])) out.push({ t: "token", v: m[4] });
    else push(m[0]);
    last = re.lastIndex;
  }
  push(s.slice(last));
  return out;
}

export function parseRichText(text: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of text.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    let para: string[] = [];
    let list: { t: "ul" | "ol"; items: Inline[][] } | null = null;
    const flushPara = () => {
      if (para.length) blocks.push({ t: "p", c: parseInline(para.join(" ")) });
      para = [];
    };
    const flushList = () => {
      if (list) blocks.push(list);
      list = null;
    };
    for (const line of lines) {
      const h = /^#{2,3}\s+(.+)$/.exec(line);
      const ul = /^[-*]\s+(.+)$/.exec(line);
      const ol = /^\d+[.)]\s+(.+)$/.exec(line);
      if (h) {
        flushPara();
        flushList();
        blocks.push({ t: "h2", v: h[1] });
      } else if (ul || ol) {
        flushPara();
        const kind = ul ? "ul" : "ol";
        if (list && (list as { t: string }).t !== kind) flushList();
        if (!list) list = { t: kind, items: [] };
        (list as { items: Inline[][] }).items.push(parseInline((ul ?? ol)![1]));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}
