import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SITE } from "../site";
import { esc, newQuoteAlert, orderReceivedEmail, welcomeEmail, type OrderEmailData } from "./templates";

const order: OrderEmailData = {
  orderNumber: "TBC-1001",
  name: "Ada <b>Obi</b>",
  phone: "08030000000",
  email: "ada@example.com",
  address: "1 Road",
  city: "Ikeja",
  state: "Lagos",
  subtotalNgn: 1_565_000,
  hasUnpricedParts: false,
  paymentMethod: "bank-transfer",
  items: [{ name: "Inverter <script>", quantity: 2, lineTotalNgn: 1_100_000 }],
  link: "https://tobecat.com/checkout/complete?order=x&token=y",
};
const bank = { bankName: "Example Bank", accountName: "Tobecat Technologies Nigeria Limited", accountNumber: "0123456789" };

test("customer text is escaped, never injected as HTML", () => {
  assert.equal(esc(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
  const e = orderReceivedEmail(DEFAULT_SITE, order, bank);
  assert.ok(!e.html.includes("<script>") && e.html.includes("Inverter &lt;script&gt;"));
  assert.ok(!e.html.includes("<b>Obi</b>"));
});

test("the order email carries the bank account and the order number as reference only for bank transfer", () => {
  const e = orderReceivedEmail(DEFAULT_SITE, order, bank);
  assert.ok(e.html.includes("0123456789") && e.html.includes("Payment reference") && e.text.includes("Reference: TBC-1001"));
  assert.ok(e.html.includes("₦1,565,000"));
  const card = orderReceivedEmail(DEFAULT_SITE, { ...order, paymentMethod: "pay-on-confirmation" }, bank);
  assert.ok(!card.html.includes("0123456789"));
});

test("welcome email greets by first name and links to the live site", () => {
  const e = welcomeEmail({ ...DEFAULT_SITE, url: "https://www.tobecat.com" }, { name: "Chidi Okafor" });
  assert.ok(e.html.includes("Hi Chidi,") && e.html.includes("https://www.tobecat.com/shop") && e.html.includes("https://www.tobecat.com/brand/logo-header.png"));
  assert.match(e.subject, /Welcome/);
});

test("quote alert lists products and keeps line breaks in the message", () => {
  const e = newQuoteAlert(DEFAULT_SITE, { reference: "Q-7", kind: "bulk", name: "Bayo", phone: "0803", location: "Abuja", services: [], message: "line1\nline2", items: [{ description: "450W panel", quantity: 20 }] }, "https://x/admin");
  assert.ok(e.html.includes("450W panel") && e.html.includes("× 20") && e.html.includes("line1<br>line2"));
  assert.match(e.subject, /bulk quote request Q-7/);
});
