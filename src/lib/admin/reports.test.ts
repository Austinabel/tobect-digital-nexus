import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSalesReport, bucket, lagosDay, rangeStart, toCsv, type ReportOrder } from "./reports";
import { parseContent } from "../content";
import { APPLIANCE_LIBRARY, presetLines } from "../calculator";

const now = new Date("2026-11-17T10:00:00Z"); // 11:00 in Lagos
const order = (id: string, created_at: string, subtotal: number, status: string, payment_status = "unpaid"): ReportOrder => ({
  id,
  created_at,
  subtotal_ngn: String(subtotal),
  status,
  payment_status,
  payment_method: "pay-on-confirmation",
});

test("Lagos days: 23:30 UTC is already the next day in Nigeria", () => {
  assert.equal(lagosDay("2026-11-16T23:30:00Z"), "2026-11-17");
  assert.equal(rangeStart(now, 7), "2026-11-10T23:00:00.000Z");
});

test("only confirmed, uncancelled orders count as sales", () => {
  const orders = [
    order("a", "2026-11-17T08:00:00Z", 100_000, "delivered", "paid"),
    order("b", "2026-11-16T08:00:00Z", 50_000, "confirmed"),
    order("c", "2026-11-16T09:00:00Z", 999_000, "new"),
    order("d", "2026-11-15T09:00:00Z", 70_000, "cancelled", "paid"),
    order("old", "2026-10-01T09:00:00Z", 500_000, "delivered", "paid"),
  ];
  const items = [
    { order_id: "a", kind: "product", item_slug: "panel", name: "Panel", quantity: 4, line_total_ngn: 80_000 },
    { order_id: "b", kind: "product", item_slug: "panel", name: "Panel", quantity: 1, line_total_ngn: 20_000 },
    { order_id: "c", kind: "product", item_slug: "inverter", name: "Inverter", quantity: 1, line_total_ngn: 999_000 },
  ];
  const r = buildSalesReport(orders, items, now, 7);
  assert.equal(r.ordersPlaced, 4, "outside the range is excluded");
  assert.equal(r.salesCount, 2);
  assert.equal(r.salesValue, 150_000);
  assert.equal(r.paidValue, 100_000, "a cancelled order isn't counted as paid");
  assert.equal(r.awaitingConfirmation, 1);
  assert.equal(r.cancelledOrReturned, 1);
  assert.equal(r.averageSale, 75_000);
  assert.deepEqual(r.topProducts.map((t) => [t.slug, t.quantity, t.revenue]), [["panel", 5, 100_000]], "unconfirmed orders' items are not sales");
  assert.equal(r.daily.length, 7);
  assert.deepEqual(r.daily.at(-1), { day: "2026-11-17", value: 100_000, orders: 1 });
  assert.equal(bucket(r.daily, 7).length, 1);
});

test("CSV quoting and spreadsheet-formula protection", () => {
  const csv = toCsv(["a", "b"], [['He said "hi"', "=HYPERLINK(1)"], [-5, null]]);
  assert.equal(csv, '"a","b"\r\n"He said ""hi""","\'=HYPERLINK(1)"\r\n"-5",""\r\n');
});

test("calculator appliance list: decimals, night ≤ day, stable ids, at least one", () => {
  const ok = parseContent("calculator", { appliances: [{ id: "fan", name: "Fan", watts: "75", hoursPerDay: "0.5", nightHours: "0.25", surge: false }, { name: "Borehole pump 1.5HP", watts: 1100, hoursPerDay: 2, surge: true }, { name: "Fan", watts: 80, hoursPerDay: 4 }] });
  assert.deepEqual(ok.errors, {});
  const list = ok.value.appliances as { id: string; hoursPerDay: number }[];
  assert.equal(list[0].hoursPerDay, 0.5);
  assert.deepEqual(list.map((a) => a.id), ["fan", "borehole-pump-1-5hp", "fan-2"], "existing id kept, new ids made from names, no duplicates");
  assert.ok(parseContent("calculator", { appliances: [{ name: "TV", watts: 100, hoursPerDay: 2, nightHours: 5 }] }).errors["appliances.0.nightHours"]);
  assert.ok(parseContent("calculator", { appliances: [] }).errors.appliances);
});

test("presets use the edited library and skip removed appliances", () => {
  const edited = APPLIANCE_LIBRARY.filter((a) => a.id !== "tv").map((a) => (a.id === "fan" ? { ...a, watts: 55 } : a));
  const lines = presetLines("home", edited);
  assert.ok(!lines.some((l) => l.name === "LED TV"));
  assert.equal(lines.find((l) => l.name === "Fan")?.watts, 55);
  assert.equal(presetLines("home").length, 6, "default library unchanged");
});
