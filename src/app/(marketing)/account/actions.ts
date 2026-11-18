"use server";

import { emailWelcome } from "@/lib/email/notify";
import { redirect } from "next/navigation";
import { safeNext, supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  fields?: Record<string, string>;
  saved?: boolean;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/**
 * Simple registration: the account is created already confirmed (no email
 * confirmation step) using the secret key on the server, then the customer
 * is signed straight in.
 */
export async function register(_: AuthState | undefined, fd: FormData): Promise<AuthState> {
  const fields = { full_name: str(fd, "full_name"), email: str(fd, "email").toLowerCase(), phone: str(fd, "phone") };
  const password = String(fd.get("password") ?? "");
  const back = { fields };

  if (fields.full_name.length < 2) return { ...back, error: "Please enter your full name." };
  if (!EMAIL.test(fields.email)) return { ...back, error: "Please enter a valid email address." };
  if (fields.phone.replace(/\D/g, "").length < 10) return { ...back, error: "Please enter a valid phone number." };
  if (password.length < 8) return { ...back, error: "Choose a password of at least 8 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { ...back, error: "The two passwords don't match." };

  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email: fields.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fields.full_name, phone: fields.phone },
  });
  if (error || !data.user) {
    const taken = /already|registered|exists/i.test(error?.message ?? "");
    return { ...back, error: taken ? "An account with this email already exists — please sign in." : "We couldn't create your account. Please try again." };
  }

  const { error: profileError } = await admin
    .from("customer_profiles")
    .insert({ id: data.user.id, full_name: fields.full_name, phone: fields.phone });
  if (profileError) {
    // Don't leave a half-created account behind.
    await admin.auth.admin.deleteUser(data.user.id);
    return { ...back, error: "We couldn't create your account. Please try again." };
  }
  emailWelcome(fields.email, fields.full_name);

  const supabase = await supabaseServer();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email: fields.email, password });
  if (signInError) redirect(`/account/login?next=${encodeURIComponent(safeNext(fd.get("next")))}`);
  redirect(safeNext(fd.get("next")));
}

export async function login(_: AuthState | undefined, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!EMAIL.test(email) || !password) return { fields: { email }, error: "Enter your email and password." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // One message for every failure, so the form doesn't reveal which emails have accounts.
  if (error) return { fields: { email }, error: "Incorrect email or password." };
  redirect(safeNext(fd.get("next")));
}

export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(_: AuthState | undefined, fd: FormData): Promise<AuthState> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/account/login?next=/account");
  const fields = {
    full_name: str(fd, "full_name"),
    phone: str(fd, "phone"),
    delivery_address: str(fd, "delivery_address"),
    city: str(fd, "city"),
    state: str(fd, "state"),
  };
  if (fields.full_name.length < 2 || fields.phone.replace(/\D/g, "").length < 10) return { fields, error: "Name and a valid phone number are required." };
  // RLS: customers can only update their own row.
  const { error } = await supabase.from("customer_profiles").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", data.user.id);
  return error ? { fields, error: "Couldn't save your details. Please try again." } : { fields, saved: true };
}

/** Site origin for links in emails (works behind a proxy / on the live domain). */
async function siteOrigin() {
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Step 1 of "forgot password": email a reset link. Always answers the same
 * way, whether or not the email has an account, so the form can't be used
 * to discover who is registered.
 */
export async function requestPasswordReset(_: AuthState | undefined, fd: FormData): Promise<AuthState> {
  const email = str(fd, "email").toLowerCase();
  if (!EMAIL.test(email)) return { fields: { email }, error: "Please enter a valid email address." };

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/account/reset-password/confirm`,
  });
  // Supabase rate-limits reset emails; tell the customer to wait rather than pretend it was sent.
  if (error && /rate|too many|seconds/i.test(error.message)) {
    return { fields: { email }, error: "Too many reset requests. Please wait a few minutes and try again." };
  }
  // The customer always sees the same reply (no account discovery), so record delivery
  // problems — e.g. email provider not configured — in the server log for the team.
  if (error) console.error(`[password-reset] Supabase could not send the reset email: ${error.message}`);
  return { fields: { email }, saved: true };
}

/** Step 3: set the new password (the reset link has already signed the customer in for this purpose). */
export async function setNewPassword(_: AuthState | undefined, fd: FormData): Promise<AuthState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Choose a password of at least 8 characters." };
  if (password !== String(fd.get("confirm") ?? "")) return { error: "The two passwords don't match." };

  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "This reset link has expired. Please request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: /different|same/i.test(error.message) ? "Please choose a password different from your old one." : "We couldn't update your password. Please try again." };
  }
  redirect("/account?password=updated");
}
