import type { SiteSettings } from "@/lib/site";
import { bankTransferDetails } from "@/lib/site";
import { newOrderAlert, newQuoteAlert, orderReceivedEmail, orderUpdateEmail, quoteReceivedEmail, welcomeEmail, type Email, type OrderEmailData, type QuoteEmailData } from "./templates";

/** Every email the site sends, filled with made-up example details — for the admin preview and test sends only. */
export function sampleEmails(site: SiteSettings): { key: string; label: string; who: string; when: string; email: Email }[] {
  const order: OrderEmailData = {
    orderNumber: "TBC-1001",
    name: "Ada Example",
    phone: "08030000000",
    email: "customer@example.com",
    address: "12 Example Street",
    city: "Ikeja",
    state: "Lagos",
    notes: "Please call before delivery.",
    subtotalNgn: 1_565_000,
    hasUnpricedParts: false,
    paymentMethod: bankTransferDetails(site) ? "bank-transfer" : "pay-on-confirmation",
    items: [
      { name: "Felicity Solar 4kva 24v Hybrid Inverter", quantity: 1, lineTotalNgn: 550_000 },
      { name: "SMS 5KWH 24V Lithium Ion Battery", quantity: 1, lineTotalNgn: 1_015_000 },
    ],
    link: `${site.url}/checkout/complete`,
  };
  const quote: QuoteEmailData = {
    reference: "Q-1001",
    kind: "standard",
    name: "Ada Example",
    phone: "08030000000",
    email: "customer@example.com",
    location: "Lekki, Lagos",
    customerType: "Home",
    services: ["Solar installation"],
    message: "I'd like a 5kVA system for a 3-bedroom flat.",
    items: [],
  };
  const update = { orderNumber: order.orderNumber, name: order.name, city: order.city, state: order.state, subtotalNgn: order.subtotalNgn, awaitingPayment: true, link: order.link };
  return [
    { key: "welcome", label: "Welcome", who: "New customer", when: "Right after someone creates an account", email: welcomeEmail(site, { name: "Ada Example" }) },
    { key: "order", label: "Order received", who: "Customer", when: "When an order is placed (includes your bank details for bank transfer)", email: orderReceivedEmail(site, order, bankTransferDetails(site)) },
    { key: "confirmed", label: "Order confirmed", who: "Customer", when: "When you confirm an order (includes how to pay while it's unpaid)", email: orderUpdateEmail(site, { ...update, event: "confirmed" }, bankTransferDetails(site)) },
    { key: "paid", label: "Payment received", who: "Customer", when: "When you record a payment, or a Paystack payment succeeds", email: orderUpdateEmail(site, { ...update, event: "paid", awaitingPayment: false }, bankTransferDetails(site)) },
    { key: "dispatched", label: "Order on its way", who: "Customer", when: "When you mark an order dispatched (also: processing, delivered, cancelled, returned, refunded)", email: orderUpdateEmail(site, { ...update, event: "dispatched", awaitingPayment: false }, bankTransferDetails(site)) },
    { key: "quote", label: "Quote request received", who: "Customer", when: "When a quote or bulk quote is requested (if they gave an email)", email: quoteReceivedEmail(site, quote) },
    { key: "order-alert", label: "New order alert", who: "Your team", when: "When an order is placed", email: newOrderAlert(site, order, `${site.url}/admin/orders`) },
    { key: "quote-alert", label: "New quote alert", who: "Your team", when: "When a quote is requested", email: newQuoteAlert(site, quote, `${site.url}/admin/quotes`) },
  ];
}
