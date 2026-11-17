/**
 * Sales reports: pure aggregation over order rows (unit-tested in
 * reports.test.ts). Definitions are deliberately plain:
 *
 * - "Sales" = orders staff have confirmed and not cancelled or returned
 *   (confirmed, processing, dispatched, delivered). New orders aren't sales yet.
 * - "Paid" = orders whose payment has been recorded as received.
 * - Days are Nigerian calendar days (Africa/Lagos, UTC+1, no daylight saving).
 */

export const SALE_STATUSES = ["confirmed", "processing", "dispatched", "delivered"] as const;
export const RANGES = [7, 30, 90, 365] as const;
export type RangeDays = (typeof RANGES)[number];

export interface ReportOrder {
  id: string;
  created_at: string;
  subtotal_ngn: number | string;
  status: string;
  payment_status: string;
  payment_method: string;
}

export interface ReportItem {
  order_id: string;
  kind: string;
  item_slug: string;
  name: string;
  quantity: number;
  line_total_ngn: number | string;
}

export const lagosDay = (iso: string | number | Date) => new Date(new Date(iso).getTime() + 3_600_000).toISOString().slice(0, 10);

/** First instant (UTC ISO) of the Lagos day `days - 1` days before `now` — the report covers `days` whole days including today. */
export function rangeStart(now: Date, days: number): string {
  const today = lagosDay(now);
  const start = Date.parse(`${today}T00:00:00+01:00`) - (days - 1) * 86_400_000;
  return new Date(start).toISOString();
}

export interface SalesReport {
  ordersPlaced: number;
  awaitingConfirmation: number;
  salesCount: number;
  salesValue: number;
  paidValue: number;
  averageSale: number | null;
  cancelledOrReturned: number;
  daily: { day: string; value: number; orders: number }[];
  topProducts: { key: string; name: string; kind: string; slug: string; quantity: number; revenue: number }[];
  byPaymentMethod: { method: string; count: number; value: number }[];
}

export function buildSalesReport(orders: ReportOrder[], items: ReportItem[], now: Date, days: number): SalesReport {
  const from = Date.parse(rangeStart(now, days));
  const inRange = orders.filter((o) => Date.parse(o.created_at) >= from && Date.parse(o.created_at) <= now.getTime());
  const sales = inRange.filter((o) => (SALE_STATUSES as readonly string[]).includes(o.status));
  const saleIds = new Set(sales.map((o) => o.id));
  const money = (v: number | string) => Number(v) || 0;

  const daily = new Map<string, { value: number; orders: number }>();
  for (let i = days - 1; i >= 0; i--) daily.set(lagosDay(now.getTime() - i * 86_400_000), { value: 0, orders: 0 });
  for (const o of sales) {
    const d = daily.get(lagosDay(o.created_at));
    if (d) {
      d.value += money(o.subtotal_ngn);
      d.orders++;
    }
  }

  const top = new Map<string, SalesReport["topProducts"][number]>();
  for (const it of items) {
    if (!saleIds.has(it.order_id)) continue;
    const key = `${it.kind}:${it.item_slug}`;
    const t = top.get(key) ?? { key, name: it.name, kind: it.kind, slug: it.item_slug, quantity: 0, revenue: 0 };
    t.quantity += it.quantity;
    t.revenue += money(it.line_total_ngn);
    top.set(key, t);
  }

  const methods = new Map<string, { count: number; value: number }>();
  for (const o of sales) {
    const m = methods.get(o.payment_method) ?? { count: 0, value: 0 };
    m.count++;
    m.value += money(o.subtotal_ngn);
    methods.set(o.payment_method, m);
  }

  const salesValue = sales.reduce((s, o) => s + money(o.subtotal_ngn), 0);
  return {
    ordersPlaced: inRange.length,
    awaitingConfirmation: inRange.filter((o) => o.status === "new").length,
    salesCount: sales.length,
    salesValue,
    paidValue: inRange.filter((o) => o.payment_status === "paid" && !["cancelled", "returned"].includes(o.status)).reduce((s, o) => s + money(o.subtotal_ngn), 0),
    averageSale: sales.length ? Math.round(salesValue / sales.length) : null,
    cancelledOrReturned: inRange.filter((o) => o.status === "cancelled" || o.status === "returned").length,
    daily: [...daily.entries()].map(([day, d]) => ({ day, ...d })),
    topProducts: [...top.values()].sort((a, b) => b.revenue - a.revenue || b.quantity - a.quantity).slice(0, 10),
    byPaymentMethod: [...methods.entries()].map(([method, m]) => ({ method, ...m })).sort((a, b) => b.value - a.value),
  };
}

/** Group daily points into weeks (for long ranges), keeping the first day of each group as its label. */
export function bucket(daily: SalesReport["daily"], size: number): SalesReport["daily"] {
  if (size <= 1) return daily;
  const out: SalesReport["daily"] = [];
  for (let i = 0; i < daily.length; i += size) {
    const g = daily.slice(i, i + size);
    out.push({ day: g[0].day, value: g.reduce((s, d) => s + d.value, 0), orders: g.reduce((s, d) => s + d.orders, 0) });
  }
  return out;
}

/** CSV with every field quoted; formula-like cells are prefixed so spreadsheets don't execute them. */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
