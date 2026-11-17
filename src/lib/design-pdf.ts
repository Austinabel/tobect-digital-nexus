/**
 * Branded PDF proposal for a solar design (A4, pdf-lib, runs in the browser
 * and in Node). Pure: all company details and data are passed in.
 *
 * The standard PDF fonts can't draw "₦", so money is written "NGN"; other
 * characters outside the font's set are replaced, never dropped silently.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { CalculatorInput } from "./calculator";
import type { SolarDesign } from "./solar-design";
import type { DesignPricing, SavingsResult } from "./design-pricing";

export interface PdfCompany {
  name: string;
  legalName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  url: string;
}

export interface PdfData {
  company: PdfCompany;
  design: SolarDesign;
  input: CalculatorInput;
  buildingLabel: string;
  regionLabel: string;
  pricing: DesignPricing;
  savings: SavingsResult | null;
  preparedFor?: string;
  date: Date;
  reference: string;
}

const NAVY = rgb(11 / 255, 25 / 255, 48 / 255);
const BLUE = rgb(21 / 255, 86 / 255, 217 / 255);
const RED = rgb(240 / 255, 20 / 255, 54 / 255);
const INK = rgb(11 / 255, 25 / 255, 48 / 255);
const SLATE = rgb(85 / 255, 100 / 255, 122 / 255);
const HAIR = rgb(219 / 255, 229 / 255, 241 / 255);
const MIST = rgb(238 / 255, 245 / 255, 255 / 255);
const WHITE = rgb(1, 1, 1);

const W = 595.28;
const H = 841.89;
const M = 40;
const FOOTER = 46;

export function naira(n: number): string {
  return `NGN ${Math.round(n).toLocaleString("en-NG")}`;
}

const REPLACE: Record<string, string> = { "₦": "NGN ", "≥": ">=", "≤": "<=", "→": "->", "−": "-", "≈": "~", "₄": "4", "↑": "^", "✓": "-" };

export async function buildDesignPdf(data: PdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Solar System Design ${data.reference}`);
  doc.setAuthor(data.company.legalName);
  doc.setCreator(data.company.url);
  doc.setSubject("Solar system design and shopping list");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const charset = new Set(font.getCharacterSet());
  const clean = (t: string) =>
    [...String(t)].map((ch) => REPLACE[ch] ?? (charset.has(ch.codePointAt(0)!) || ch === "\n" ? ch : "?")).join("");

  let page: PDFPage = doc.addPage([W, H]);
  let y = H;

  const newPage = () => {
    page = doc.addPage([W, H]);
    // slim running header on continuation pages
    page.drawRectangle({ x: 0, y: H - 28, width: W, height: 28, color: NAVY });
    page.drawText(clean(`${data.company.name} · Solar System Design ${data.reference}`), { x: M, y: H - 18, size: 8.5, font: bold, color: WHITE });
    y = H - 50;
  };
  const ensure = (h: number) => {
    if (y - h < FOOTER + 10) newPage();
  };

  const wrap = (text: string, f: PDFFont, size: number, width: number): string[] => {
    const out: string[] = [];
    for (const para of clean(text).split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        const tryLine = line ? `${line} ${word}` : word;
        if (f.widthOfTextAtSize(tryLine, size) <= width) line = tryLine;
        else {
          if (line) out.push(line);
          line = word;
        }
      }
      out.push(line);
    }
    return out;
  };
  const para = (text: string, opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const size = opts.size ?? 9.5;
    const lines = wrap(text, opts.f ?? font, size, W - 2 * M);
    for (const l of lines) {
      ensure(size + 4);
      page.drawText(l, { x: M, y: y - size, size, font: opts.f ?? font, color: opts.color ?? INK });
      y -= size + 3.5;
    }
    y -= opts.gap ?? 4;
  };
  const heading = (text: string) => {
    ensure(40);
    y -= 10;
    page.drawRectangle({ x: M, y: y - 14, width: 3, height: 14, color: RED });
    page.drawText(clean(text.toUpperCase()), { x: M + 9, y: y - 11.5, size: 10.5, font: bold, color: NAVY });
    y -= 24;
  };

  /** Simple table with wrapping cells, zebra rows and page breaks (header repeats). */
  const table = (cols: { title: string; width: number; align?: "right" }[], rows: string[][], opts: { boldLast?: boolean } = {}) => {
    const size = 8.5;
    const pad = 5;
    const drawHeader = () => {
      // keep the header with at least one row — never strand it at the bottom of a page
      ensure(22 + 34);
      page.drawRectangle({ x: M, y: y - 18, width: W - 2 * M, height: 18, color: NAVY });
      let x = M;
      for (const c of cols) {
        const t = clean(c.title);
        const tx = c.align === "right" ? x + c.width - pad - bold.widthOfTextAtSize(t, size) : x + pad;
        page.drawText(t, { x: tx, y: y - 12.5, size, font: bold, color: WHITE });
        x += c.width;
      }
      y -= 18;
    };
    drawHeader();
    rows.forEach((row, ri) => {
      const isLast = opts.boldLast && ri === rows.length - 1;
      const f = isLast ? bold : font;
      const cells = row.map((cell, ci) => wrap(cell, f, size, cols[ci].width - 2 * pad));
      const h = Math.max(...cells.map((c) => c.length)) * (size + 2.5) + 2 * pad - 2;
      if (y - h < FOOTER + 10) {
        newPage();
        drawHeader();
      }
      if (ri % 2 === 1 || isLast) page.drawRectangle({ x: M, y: y - h, width: W - 2 * M, height: h, color: isLast ? MIST : rgb(0.97, 0.98, 0.995) });
      let x = M;
      cells.forEach((lines, ci) => {
        lines.forEach((l, li) => {
          const tx = cols[ci].align === "right" ? x + cols[ci].width - pad - f.widthOfTextAtSize(l, size) : x + pad;
          page.drawText(l, { x: tx, y: y - pad - size + 1 - li * (size + 2.5), size, font: f, color: INK });
        });
        x += cols[ci].width;
      });
      page.drawLine({ start: { x: M, y: y - h }, end: { x: W - M, y: y - h }, thickness: 0.5, color: HAIR });
      y -= h;
    });
    y -= 6;
  };

  /** Two-column label/value grid. */
  const facts = (items: [string, string][]) => {
    const colW = (W - 2 * M - 12) / 2;
    for (let i = 0; i < items.length; i += 2) {
      const pair = items.slice(i, i + 2);
      const heights = pair.map(([, v]) => wrap(v, bold, 10, colW - 16).length);
      const h = 18 + Math.max(...heights) * 13;
      ensure(h + 6);
      pair.forEach(([label, value], j) => {
        const x = M + j * (colW + 12);
        page.drawRectangle({ x, y: y - h, width: colW, height: h, color: MIST, borderColor: HAIR, borderWidth: 0.5 });
        page.drawText(clean(label.toUpperCase()), { x: x + 8, y: y - 12, size: 7, font: bold, color: SLATE });
        wrap(value, bold, 10, colW - 16).forEach((l, li) => page.drawText(l, { x: x + 8, y: y - 26 - li * 13, size: 10, font: bold, color: INK }));
      });
      y -= h + 6;
    }
    y -= 2;
  };

  // ---------------- cover header ----------------
  const { design, input, pricing, company } = data;
  page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: NAVY });
  page.drawRectangle({ x: W - 26, y: H - 96, width: 12, height: 96, color: RED, opacity: 0.9 });
  page.drawRectangle({ x: W - 10, y: H - 96, width: 4, height: 96, color: BLUE });
  page.drawRectangle({ x: M, y: H - 66, width: 34, height: 34, color: BLUE });
  page.drawSvgPath("M13 2 4 14h6l-1 8 9-12h-6l1-8Z", { x: M + 5, y: H - 37, scale: 1.0, color: WHITE });
  page.drawText("TOBECAT", { x: M + 44, y: H - 50, size: 18, font: bold, color: WHITE });
  page.drawText(clean(company.legalName.toUpperCase()), { x: M + 44, y: H - 63, size: 6.8, font: bold, color: rgb(0.75, 0.82, 0.92) });
  const titleRight = "SOLAR SYSTEM DESIGN";
  page.drawText(titleRight, { x: W - M - bold.widthOfTextAtSize(titleRight, 12), y: H - 46, size: 12, font: bold, color: WHITE });
  const meta = clean(`Ref ${data.reference} · ${data.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);
  page.drawText(meta, { x: W - M - font.widthOfTextAtSize(meta, 8.5), y: H - 61, size: 8.5, font, color: rgb(0.8, 0.86, 0.95) });
  y = H - 96;
  page.drawRectangle({ x: 0, y: y - 22, width: W, height: 22, color: MIST });
  const contact = clean(`${company.phone}  ·  WhatsApp ${company.whatsapp}  ·  ${company.email}  ·  ${company.address}`);
  page.drawText(contact, { x: M, y: y - 14.5, size: 7.8, font, color: SLATE });
  y -= 36;

  if (data.preparedFor) para(`Prepared for: ${data.preparedFor}`, { f: bold, size: 11, gap: 2 });
  para(
    `This design sizes a solar system for the appliances listed by the customer and lists everything needed to install it, including cable sizes and lengths and protection devices.`,
    { color: SLATE, size: 9 },
  );

  // ---------------- requirements ----------------
  const b = design.base;
  heading("Your requirements");
  facts([
    ["Building", `${data.buildingLabel} · ${input.loads.filter((l) => l.quantity > 0 && l.watts > 0).length} appliance types`],
    ["Daily energy use", `${(b.dailyEnergyWh / 1000).toFixed(1)} kWh (${(b.nightEnergyWh / 1000).toFixed(1)} kWh after dark)`],
    ["Peak load", `${Math.round(b.simultaneousLoadW).toLocaleString("en-NG")} W running together`],
    ["Battery sized for", input.batterySizing === "night" ? "All night-time use (solar-first / off-grid)" : `${input.backupHours} h of outage backup`],
    ["Location", `${data.regionLabel} · ${design.peakSunHours} peak sun hours`],
    ["Growth allowance", (input.growthPct ?? 0) > 0 ? `+${input.growthPct}% load on inverter, cables & breakers` : "None"],
  ]);

  heading("Recommended system");
  facts([
    ["Inverter", `${design.inverterName ? `${design.inverterName} — ` : ""}${design.inverterKva} kVA · ${design.systemV} V · ${design.phase === "three" ? "three-phase" : "single-phase"}`],
    ["Battery bank", design.battery ? `${design.battery.bankKwh} kWh — ${design.battery.totalModules} × ${design.battery.module.label} (${design.battery.inSeries}S × ${design.battery.inParallel}P)` : "—"],
    ["Solar array", `${design.strings.totalPanels} × ${design.strings.arrayKwp > 0 ? input.panelWatt : 0} W = ${design.strings.arrayKwp} kWp${design.strings.fits ? ` (${design.strings.strings} × ${design.strings.panelsPerString} in series)` : ""}`],
    ["Daily solar (average day)", `${design.dailyGenerationKwh} kWh · covers about ${design.solarCoveragePct}% of daily use`],
    ["Backup achieved", design.battery ? `about ${design.battery.backupHoursAchieved} h at your backup load` : "—"],
    ["Room to grow", `about ${design.growthHeadroomW.toLocaleString("en-NG")} W more continuous load on this inverter`],
  ]);

  heading("Cables — sizes and lengths to buy");
  table(
    [
      { title: "Cable", width: 150 },
      { title: "Size", width: 52, align: "right" },
      { title: "Buy", width: 120 },
      { title: "Notes", width: W - 2 * M - 322 },
    ],
    design.cables.map((c) => [
      c.label,
      c.sizeMm2 ? `${c.sizeMm2} mm²` : "—",
      c.lengths.map((l) => `${l.colour}: ${l.metres} m`).join("\n"),
      [c.type, c.designCurrentA !== undefined ? `Design current ${c.designCurrentA} A, voltage drop ${c.dropPct}%` : "", c.note ?? ""].filter(Boolean).join(". "),
    ]),
  );

  heading("Breakers & protection");
  table(
    [
      { title: "Device", width: 200 },
      { title: "Rating", width: 150 },
      { title: "Qty", width: 40, align: "right" },
      { title: "Notes", width: W - 2 * M - 390 },
    ],
    design.protection.map((p) => [p.label, p.rating, String(p.qty), p.note ?? ""]),
  );

  heading("Shopping list");
  const priceOf = new Map(pricing.priced.map((p) => [p.bom, p]));
  const rows = design.bom.map((line) => {
    const p = priceOf.get(line);
    return [
      p && p.product.name !== line.item ? `${line.item}\n(${p.product.name})` : line.item,
      line.spec,
      `${line.qty} ${line.unit}`,
      p ? naira(p.unitPriceNgn) : "Quoted",
      p ? naira(p.totalNgn) : "—",
    ];
  });
  rows.push(["Priced items subtotal", `${pricing.unpriced.length} item${pricing.unpriced.length === 1 ? "" : "s"} to be quoted by ${company.name}`, "", "", naira(pricing.pricedSubtotalNgn)]);
  table(
    [
      { title: "Item", width: 140 },
      { title: "Specification", width: 175 },
      { title: "Qty", width: 55, align: "right" },
      { title: "Unit price", width: 70, align: "right" },
      { title: "Total", width: W - 2 * M - 440, align: "right" },
    ],
    rows,
    { boldLast: true },
  );
  para(
    pricing.priced.length
      ? "Prices are from the Tobecat online shop on the date above and are indicative; the final price is confirmed in your quotation. Items marked \"Quoted\" are priced by our team."
      : "None of the main equipment matches a product currently listed in our online shop, so every item will be priced in your quotation.",
    { size: 8, color: SLATE },
  );

  if (data.savings) {
    heading("Generator savings (your figures)");
    facts([
      ["Generator cost per month", naira(data.savings.monthlyNgn)],
      ["Per year", naira(data.savings.yearlyNgn)],
      ["Payback", data.savings.paybackMonths !== null ? `about ${data.savings.paybackMonths} months` : "Needs the system price from your quotation"],
      ["After 5 years", data.savings.fiveYearNetNgn !== null ? `${data.savings.fiveYearNetNgn >= 0 ? "" : "-"}${naira(Math.abs(data.savings.fiveYearNetNgn))} net` : "—"],
    ]);
    para("Based on the fuel and servicing spend you entered, if solar replaces the generator for this load.", { size: 8, color: SLATE });
  }

  if (design.warnings.length) {
    heading("Notes");
    design.warnings.forEach((w) => para(`•  ${w}`, { size: 9, gap: 1 }));
  }

  heading("Assumptions");
  para(
    "Planning estimate, not a final engineering design. Sizing uses typical appliance ratings, a 0.8 inverter power factor with 25% headroom, " +
      "PV system losses of 28%, copper cable rated conservatively with voltage drop of no more than 3% (PV and AC) and 1% (battery), " +
      "breakers at 125% of operating current and 10% extra cable for routing. A Tobecat engineer confirms equipment datasheets, cable routes and " +
      "protection on site before installation.",
    { size: 8, color: SLATE },
  );

  // ---------------- footers ----------------
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: FOOTER - 8 }, end: { x: W - M, y: FOOTER - 8 }, thickness: 0.5, color: HAIR });
    p.drawText(clean(`${company.legalName} · ${company.url.replace(/^https?:\/\//, "")}`), { x: M, y: FOOTER - 22, size: 7.5, font, color: SLATE });
    const num = `Page ${i + 1} of ${pages.length}`;
    p.drawText(num, { x: W - M - font.widthOfTextAtSize(num, 7.5), y: FOOTER - 22, size: 7.5, font, color: SLATE });
  });

  return doc.save();
}
