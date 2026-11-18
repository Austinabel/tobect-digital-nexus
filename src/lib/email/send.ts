import type { Email } from "./templates";

/**
 * Sends email through Resend (https://resend.com). Needs two environment
 * variables (Vercel → Settings → Environment Variables, and .env.local):
 *   RESEND_API_KEY  the API key from Resend
 *   EMAIL_FROM      a sender on your verified domain, e.g. "Tobecat Technologies <hello@tobecat.com>"
 * Without them nothing is sent and the site works exactly as before.
 * Email is a courtesy on top of what's saved in the admin, so a failure is
 * logged, never shown to the customer.
 */
export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(to: string | null | undefined, email: Email, opts: { replyTo?: string } = {}): Promise<{ ok: boolean; error?: string }> {
  if (!to) return { ok: false, error: "No recipient." };
  if (!emailEnabled()) return { ok: false, error: "Email sending isn't set up yet (RESEND_API_KEY / EMAIL_FROM)." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10_000),
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject: email.subject, html: email.html, text: email.text, ...(opts.replyTo ? { reply_to: opts.replyTo } : {}) }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`Email "${email.subject}" to ${to} failed: ${res.status} ${detail.slice(0, 300)}`);
      return { ok: false, error: `The email service answered ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    console.error(`Email "${email.subject}" to ${to} failed:`, e);
    return { ok: false, error: "Couldn't reach the email service." };
  }
}
