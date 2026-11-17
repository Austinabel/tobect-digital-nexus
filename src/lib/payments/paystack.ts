/**
 * Paystack (card, bank transfer, USSD) via its standard redirect flow.
 * Server-only — uses PAYSTACK_SECRET_KEY. Online payment is switched on
 * simply by adding that key to the environment; without it checkout offers
 * "pay after confirmation" only and the site makes no online-payment claim.
 *
 * Flow: initialize → customer pays on Paystack's page → Paystack redirects
 * to /checkout/paystack/callback → we VERIFY with Paystack's API (amount,
 * currency, status) before marking the order paid. The redirect alone is
 * never trusted.
 */
const API = "https://api.paystack.co";

export function onlinePaymentEnabled(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as { status?: boolean; message?: string; data?: T } | null;
  if (!res.ok || !body?.status || !body.data) throw new Error(`Paystack: ${body?.message ?? res.status}`);
  return body.data;
}

export async function initializePayment(input: { email: string; amountNgn: number; reference: string; callbackUrl: string; orderNumber: string }) {
  return call<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNgn * 100), // kobo
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { order_number: input.orderNumber },
    }),
  });
}

export async function verifyPayment(reference: string) {
  return call<{ status: string; amount: number; currency: string; reference: string; paid_at: string | null }>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}
