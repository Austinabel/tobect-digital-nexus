"use server";

import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { getSite } from "@/lib/site-server";
import { sendEmail } from "@/lib/email/send";
import { sampleEmails } from "@/lib/email/samples";

/** Sends one template, filled with sample details, to the signed-in staff member. */
export async function sendTestEmail(fd: FormData) {
  const actor = await requirePermission("settings.manage");
  const key = String(fd.get("template") ?? "");
  const sample = sampleEmails(await getSite()).find((s) => s.key === key);
  if (!sample) redirect("/admin/emails");
  const site = await getSite();
  const res = await sendEmail(actor.email, { ...sample.email, subject: `[Test] ${sample.email.subject}` }, { replyTo: site.email });
  if (res.ok) await logActivity(actor, { action: "email.test", entityType: "settings", summary: `Sent a test "${sample.label}" email to ${actor.email}` });
  const notice = res.ok ? `Test “${sample.label}” sent to ${actor.email} — check your inbox (and spam folder).` : `Not sent: ${res.error}`;
  redirect(`/admin/emails?${new URLSearchParams({ notice, show: key })}`);
}
