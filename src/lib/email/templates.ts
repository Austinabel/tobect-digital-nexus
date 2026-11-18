/**
 * Email templates: plain functions that turn data into { subject, html, text }.
 * Table layout and inline styles, because email apps (Gmail, Outlook, phones)
 * ignore most modern CSS. Everything a customer typed is HTML-escaped.
 */
import { siteLinks, type SiteSettings } from "../site";

export interface Email {
  subject: string;
  html: string;
  text: string;
}

const BLUE = "#1556d9";
const NAVY = "#0b1930";
const RED = "#e3142f";
const INK = "#0d1b2f";
const SLATE = "#5b6b82";
const MIST = "#eef4ff";
const HAIR = "#e3e9f2";
const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

export function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

const firstName = (full: string) => full.trim().split(/\s+/)[0] || "there";

/** An absolute link on the website (emails can't use relative links). */
const abs = (site: SiteSettings, path: string) => (/^https?:\/\//.test(path) ? path : `${site.url.replace(/\/$/, "")}${path}`);

function button(href: string, label: string, color = RED): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px"><tr><td style="border-radius:999px;background:${color}">
<a href="${esc(href)}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px">${esc(label)}</a>
</td></tr></table>`;
}

const p = (html: string) => `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK}">${html}</p>`;
const h2 = (text: string) => `<h2 style="margin:22px 0 10px;font-family:${FONT};font-size:17px;color:${INK}">${esc(text)}</h2>`;

/** Label / value rows, e.g. the bank account or an order summary. */
function table(rows: [string, string][], opts: { boldLast?: boolean; tint?: boolean } = {}): string {
  const body = rows
    .map(([k, v], i) => {
      const last = opts.boldLast && i === rows.length - 1;
      return `<tr><td style="padding:9px 14px;border-top:${i ? `1px solid ${HAIR}` : "0"};font-family:${FONT};font-size:14px;color:${SLATE}">${esc(k)}</td>
<td align="right" style="padding:9px 14px;border-top:${i ? `1px solid ${HAIR}` : "0"};font-family:${FONT};font-size:14px;color:${INK};font-weight:${last ? "bold" : "normal"}">${v}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${HAIR};border-radius:12px;border-collapse:separate;background:${opts.tint ? MIST : "#ffffff"};margin:6px 0 16px">${body}</table>`;
}

function bullets(items: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 14px">${items
    .map(
      (t) => `<tr><td valign="top" style="padding:4px 10px 4px 0;font-family:${FONT};font-size:15px;color:${BLUE};font-weight:bold">✓</td>
<td style="padding:4px 0;font-family:${FONT};font-size:15px;line-height:1.5;color:${INK}">${t}</td></tr>`,
    )
    .join("")}</table>`;
}

/** The branded frame every email uses: logo bar, white card, contact footer. */
export function layout(site: SiteSettings, o: { preheader: string; heading: string; body: string }): string {
  const { PHONE_HREF, EMAIL_HREF, whatsappHref } = siteLinks(site);
  const logo = site.brand.logoHeaderUrl ? abs(site, site.brand.logoHeaderUrl) : null;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.heading)}</title></head>
<body style="margin:0;padding:0;background:#f3f6fb">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:18px 24px;background:#ffffff;border-radius:16px 16px 0 0;border-bottom:3px solid ${RED}">
${logo ? `<img src="${esc(logo)}" alt="${esc(site.name)}" height="44" style="display:block;height:44px;width:auto;border:0">` : `<span style="font-family:${FONT};font-size:22px;font-weight:bold;color:${BLUE}">${esc(site.brand.wordmark)}</span>`}
</td></tr>
<tr><td style="padding:30px 28px 14px;background:${NAVY};background-image:linear-gradient(120deg,${NAVY},#0d2a5c 60%,${BLUE})">
<h1 style="margin:0;font-family:${FONT};font-size:25px;line-height:1.25;color:#ffffff">${esc(o.heading)}</h1>
<div style="height:16px"></div></td></tr>
<tr><td style="padding:28px;background:#ffffff">${o.body}</td></tr>
<tr><td style="padding:20px 28px;background:#ffffff;border-top:1px solid ${HAIR};border-radius:0 0 16px 16px">
<p style="margin:0 0 6px;font-family:${FONT};font-size:13px;color:${SLATE}">Questions? We&rsquo;re here to help:</p>
<p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.8">
<a href="${esc(PHONE_HREF)}" style="color:${BLUE};text-decoration:none">${esc(site.phone)}</a> &nbsp;·&nbsp;
<a href="${esc(whatsappHref())}" style="color:${BLUE};text-decoration:none">WhatsApp ${esc(site.whatsapp)}</a> &nbsp;·&nbsp;
<a href="${esc(EMAIL_HREF)}" style="color:${BLUE};text-decoration:none">${esc(site.email)}</a></p>
</td></tr>
<tr><td align="center" style="padding:16px 12px;font-family:${FONT};font-size:12px;line-height:1.6;color:${SLATE}">
${esc(site.legalName)}<br>${esc(site.address.street)}, ${esc(site.address.city)}, ${esc(site.address.country)}<br>
<a href="${esc(site.url)}" style="color:${SLATE}">${esc(site.url.replace(/^https?:\/\//, ""))}</a></td></tr>
</table></td></tr></table></body></html>`;
}

// ---------------------------------------------------------------- customers

export function welcomeEmail(site: SiteSettings, c: { name: string }): Email {
  const name = firstName(c.name);
  const body = [
    p(`Hi ${esc(name)},`),
    p(`Thank you for creating an account with <b>${esc(site.name)}</b>. We&rsquo;re glad to have you with us.`),
    p("With your account you can:"),
    bullets([
      "Shop solar panels, inverters, lithium batteries, solar generators and CCTV",
      "Size your system with our free solar calculator and save your designs",
      "Check out faster and follow your orders in one place",
      "Request quotes for complete solar installations by our engineers",
    ]),
    button(abs(site, "/shop"), "Start Shopping"),
    p(`Not sure what size of system you need? <a href="${esc(abs(site, "/solar-calculator"))}" style="color:${BLUE}">Use the solar calculator</a> or simply reply to this email and our team will advise you.`),
    p(`Welcome aboard,<br><b>The ${esc(site.shortName)} team</b>`),
  ].join("");
  return {
    subject: `Welcome to ${site.name}`,
    html: layout(site, { preheader: `Your ${site.shortName} account is ready — shop, size your system and track your orders.`, heading: `Welcome to ${site.name}!`, body }),
    text: `Hi ${name},\n\nThank you for creating an account with ${site.name}. With your account you can shop solar and security products, save solar calculator designs, check out faster and follow your orders.\n\nStart shopping: ${abs(site, "/shop")}\n\nQuestions? Call ${site.phone}, WhatsApp ${site.whatsapp} or email ${site.email}.\n\nThe ${site.shortName} team`,
  };
}

export interface OrderEmailData {
  orderNumber: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  state: string;
  notes?: string | null;
  subtotalNgn: number;
  hasUnpricedParts: boolean;
  paymentMethod: "paystack" | "bank-transfer" | "pay-on-confirmation";
  items: { name: string; quantity: number; lineTotalNgn: number }[];
  /** link to the order confirmation page (with its access token) */
  link: string;
}

const orderRows = (o: OrderEmailData): [string, string][] => [
  ...o.items.map((i): [string, string] => [`${i.quantity} × ${i.name}`, naira(i.lineTotalNgn)]),
  ["Subtotal", naira(o.subtotalNgn)],
];

export function orderReceivedEmail(site: SiteSettings, o: OrderEmailData, bank: SiteSettings["bank"] | null): Email {
  const transfer = o.paymentMethod === "bank-transfer" && bank;
  const body = [
    p(`Hi ${esc(firstName(o.name))},`),
    p(`Thank you for your order. We&rsquo;ve received it and our team will confirm stock and delivery to <b>${esc(o.city)}, ${esc(o.state)}</b> shortly.`),
    h2(`Order ${o.orderNumber}`),
    table(orderRows(o).map(([k, v]) => [k, esc(v)]), { boldLast: true }),
    o.hasUnpricedParts ? p(`<span style="color:${SLATE};font-size:14px">Kit accessories and any quoted extras will be confirmed with you before payment.</span>`) : "",
    transfer
      ? h2("Pay by bank transfer") +
        table(
          [
            ["Bank", esc(bank.bankName)],
            ["Account number", `<b>${esc(bank.accountNumber)}</b>`],
            ["Account name", esc(bank.accountName)],
            ["Payment reference", `<b>${esc(o.orderNumber)}</b>`],
            ["Amount", `<b>${esc(naira(o.subtotalNgn))}</b>`],
          ],
          { tint: true },
        ) +
        p(`Please use <b>${esc(o.orderNumber)}</b> as the transfer narration so we can match your payment. If there&rsquo;s a delivery charge, we&rsquo;ll tell you when we confirm your order.`)
      : o.paymentMethod === "pay-on-confirmation"
        ? p("We&rsquo;ll send you payment details once we&rsquo;ve confirmed your order.")
        : "",
    button(o.link, "View Your Order", BLUE),
    p(`Thank you for choosing ${esc(site.name)}.`),
  ].join("");
  const text = [
    `Hi ${firstName(o.name)},`,
    `Thank you for your order ${o.orderNumber}. We'll confirm stock and delivery to ${o.city}, ${o.state} shortly.`,
    ...o.items.map((i) => `${i.quantity} x ${i.name} — ${naira(i.lineTotalNgn)}`),
    `Subtotal: ${naira(o.subtotalNgn)}`,
    transfer ? `Pay by bank transfer: ${bank.bankName}, ${bank.accountNumber}, ${bank.accountName}. Reference: ${o.orderNumber}.` : "",
    `View your order: ${o.link}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { subject: `Order ${o.orderNumber} received — ${site.name}`, html: layout(site, { preheader: `We've received order ${o.orderNumber}.`, heading: "Thank you for your order!", body }), text };
}

export interface QuoteEmailData {
  reference: string;
  kind: "standard" | "bulk";
  name: string;
  phone: string;
  email?: string | null;
  location: string;
  businessName?: string | null;
  customerType?: string | null;
  services: string[];
  message?: string | null;
  items: { description: string; quantity: number }[];
}

export function quoteReceivedEmail(site: SiteSettings, q: QuoteEmailData): Email {
  const body = [
    p(`Hi ${esc(firstName(q.name))},`),
    p(`Thank you for your ${q.kind === "bulk" ? "bulk " : ""}quote request. Our team is reviewing it and will get back to you with a quotation, usually within one working day.`),
    table([["Your reference", `<b>${esc(q.reference)}</b>`], ["Location", esc(q.location)]], { tint: true }),
    p("If you need it sooner, message us on WhatsApp with your reference."),
    button(siteLinks(site).whatsappHref(`Hello ${site.shortName}, I'm following up on my quote request ${q.reference}.`), "Chat on WhatsApp", "#1faa59"),
  ].join("");
  return {
    subject: `We've received your quote request (${q.reference})`,
    html: layout(site, { preheader: `Your quote request ${q.reference} is with our team.`, heading: "Your quote request is in", body }),
    text: `Hi ${firstName(q.name)},\n\nThank you for your quote request (reference ${q.reference}). Our team will get back to you with a quotation, usually within one working day.\n\nWhatsApp: ${site.whatsapp}`,
  };
}

// ---------------------------------------------------------------- staff alerts

export function newOrderAlert(site: SiteSettings, o: OrderEmailData, adminLink: string): Email {
  const method = { paystack: "Online (Paystack)", "bank-transfer": "Bank transfer", "pay-on-confirmation": "Pay after confirmation" }[o.paymentMethod];
  const body = [
    p(`A new order has been placed on the website.`),
    table(orderRows(o).map(([k, v]) => [k, esc(v)]), { boldLast: true }),
    table([
      ["Customer", esc(o.name)],
      ["Phone", esc(o.phone)],
      ["Email", esc(o.email || "—")],
      ["Deliver to", `${esc(o.address)}, ${esc(o.city)}, ${esc(o.state)}`],
      ["Payment", esc(method)],
      ...(o.notes ? ([["Notes", esc(o.notes)]] as [string, string][]) : []),
    ]),
    button(adminLink, "Open in Admin", BLUE),
  ].join("");
  return {
    subject: `New order ${o.orderNumber} — ${naira(o.subtotalNgn)} from ${o.name}`,
    html: layout(site, { preheader: `${o.name}, ${o.city} — ${naira(o.subtotalNgn)}`, heading: `New order ${o.orderNumber}`, body }),
    text: `New order ${o.orderNumber} from ${o.name} (${o.phone}) — ${naira(o.subtotalNgn)}, ${method}.\n${adminLink}`,
  };
}

export function newQuoteAlert(site: SiteSettings, q: QuoteEmailData, adminLink: string): Email {
  const rows: [string, string][] = [
    ["Reference", `<b>${esc(q.reference)}</b>`],
    ["Type", q.kind === "bulk" ? "Bulk quote" : "Quote"],
    ["Name", esc(q.name)],
    ["Phone", esc(q.phone)],
    ["Email", esc(q.email || "—")],
    ["Location", esc(q.location)],
    ...(q.businessName ? ([["Business", esc(q.businessName)]] as [string, string][]) : []),
    ...(q.customerType ? ([["Customer type", esc(q.customerType)]] as [string, string][]) : []),
    ...(q.services.length ? ([["Services", esc(q.services.join(", "))]] as [string, string][]) : []),
  ];
  const body = [
    p("A new quote request has come in from the website."),
    table(rows),
    q.items.length ? h2("Products") + table(q.items.map((i): [string, string] => [esc(i.description), `× ${i.quantity}`])) : "",
    q.message ? h2("Project details") + p(esc(q.message).replace(/\n/g, "<br>")) : "",
    button(adminLink, "Open in Admin", BLUE),
  ].join("");
  return {
    subject: `New ${q.kind === "bulk" ? "bulk " : ""}quote request ${q.reference} from ${q.name}`,
    html: layout(site, { preheader: `${q.name}, ${q.location}`, heading: `New quote request ${q.reference}`, body }),
    text: `New quote request ${q.reference} from ${q.name} (${q.phone}), ${q.location}.\n${adminLink}`,
  };
}

// ---------------------------------------------------------------- order updates

export type OrderUpdateEvent = "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled" | "returned" | "paid" | "refunded";

export interface OrderUpdateData {
  event: OrderUpdateEvent;
  orderNumber: string;
  name: string;
  city: string;
  state: string;
  subtotalNgn: number;
  /** still waiting for payment (and not paid online) — the email then says how to pay */
  awaitingPayment: boolean;
  link: string;
}

const UPDATE_COPY: Record<OrderUpdateEvent, { subject: string; heading: string; line: (o: OrderUpdateData) => string }> = {
  confirmed: { subject: "confirmed", heading: "Your order is confirmed", line: () => "Good news — we&rsquo;ve confirmed your order and reserved your items. We&rsquo;ll let you know as soon as it&rsquo;s on its way." },
  processing: { subject: "is being prepared", heading: "We're preparing your order", line: () => "Your order is being prepared for delivery." },
  dispatched: { subject: "is on its way", heading: "Your order is on its way", line: (o) => `Your order has left our warehouse and is on its way to <b>${esc(o.city)}, ${esc(o.state)}</b>. Please keep your phone close — the delivery team will call you.` },
  delivered: { subject: "has been delivered", heading: "Your order has been delivered", line: () => "Your order has been delivered. Thank you for choosing us! If anything isn&rsquo;t right, or you&rsquo;d like help with installation, just reply to this email or message us on WhatsApp." },
  cancelled: { subject: "has been cancelled", heading: "Your order has been cancelled", line: () => "Your order has been cancelled. If you didn&rsquo;t expect this or have any questions, please contact us — we&rsquo;re happy to help." },
  returned: { subject: "return has been processed", heading: "Your return has been processed", line: () => "We&rsquo;ve processed the return of your order. If you have any questions, please contact us." },
  paid: { subject: "payment received", heading: "Payment received — thank you!", line: (o) => `We&rsquo;ve received your payment of <b>${esc(naira(o.subtotalNgn))}</b>. Your order is now being processed.` },
  refunded: { subject: "refund processed", heading: "Your refund has been processed", line: () => "We&rsquo;ve processed a refund for your order. Depending on your bank it can take a few working days to show. If you have any questions, please contact us." },
};

export function orderUpdateEmail(site: SiteSettings, o: OrderUpdateData, bank: SiteSettings["bank"] | null): Email {
  const copy = UPDATE_COPY[o.event];
  // how to pay: only while an order is going ahead and still unpaid
  const payNow = o.awaitingPayment && bank && (o.event === "confirmed" || o.event === "processing");
  const body = [
    p(`Hi ${esc(firstName(o.name))},`),
    p(copy.line(o)),
    table([["Order", `<b>${esc(o.orderNumber)}</b>`], ["Total", esc(naira(o.subtotalNgn))]], { tint: true }),
    payNow
      ? h2("How to pay") +
        p("Please pay by bank transfer to:") +
        table(
          [
            ["Bank", esc(bank.bankName)],
            ["Account number", `<b>${esc(bank.accountNumber)}</b>`],
            ["Account name", esc(bank.accountName)],
            ["Payment reference", `<b>${esc(o.orderNumber)}</b>`],
          ],
          { tint: true },
        ) +
        p(`Use <b>${esc(o.orderNumber)}</b> as the transfer narration so we can match your payment.`)
      : "",
    button(o.link, "View Your Order", BLUE),
    p(`Thank you,<br><b>The ${esc(site.shortName)} team</b>`),
  ].join("");
  return {
    subject: `Order ${o.orderNumber} ${copy.subject} — ${site.name}`,
    html: layout(site, { preheader: `Order ${o.orderNumber}: ${copy.heading.toLowerCase()}.`, heading: copy.heading, body }),
    text: `Hi ${firstName(o.name)},\n\n${copy.line(o).replace(/<[^>]+>/g, "").replace(/&rsquo;/g, "'")}\n\nOrder ${o.orderNumber} — ${naira(o.subtotalNgn)}${payNow ? `\nPay by bank transfer: ${bank.bankName}, ${bank.accountNumber}, ${bank.accountName}. Reference: ${o.orderNumber}.` : ""}\n\nView your order: ${o.link}\n\nThe ${site.shortName} team`,
  };
}
