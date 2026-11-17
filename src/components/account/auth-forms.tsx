"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSite } from "@/components/site-provider";
import { login, register, requestPasswordReset, setNewPassword, type AuthState } from "@/app/(marketing)/account/actions";

export const fieldClass =
  "h-12 w-full rounded-xl border border-hair bg-white px-3.5 text-[0.95rem] text-ink outline-none transition-colors focus:border-blue focus:ring-3 focus:ring-blue/15";
export const labelClass = "mb-1.5 block text-[0.82rem] font-semibold text-ink";

function ErrorBox({ state }: { state?: AuthState }) {
  if (!state?.error) return null;
  return (
    <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-3.5 py-2.5 text-[0.86rem] text-red-dark">
      {state.error}
    </p>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-12 w-full rounded-full bg-blue font-heading text-[0.95rem] font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-60"
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

export function LoginForm({ next }: { next: string }) {
  const site = useSite();
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <ErrorBox state={state} />
      <label className="block">
        <span className={labelClass}>Email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} className={fieldClass} />
      </label>
      <label className="block">
        <span className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[0.82rem] font-semibold text-ink">Password</span>
          <Link href="/account/forgot-password" className="text-[0.8rem] font-semibold text-blue hover:underline">
            Forgot password?
          </Link>
        </span>
        <input name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </label>
      <Submit pending={pending}>Sign In</Submit>
      <p className="text-center text-[0.86rem] text-slate">
        New to {site.shortName}?{" "}
        <Link href={`/account/register?next=${encodeURIComponent(next)}`} className="font-semibold text-blue hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(register, undefined);
  const f = state?.fields ?? {};
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <ErrorBox state={state} />
      <label className="block">
        <span className={labelClass}>Full name</span>
        <input name="full_name" autoComplete="name" required defaultValue={f.full_name} className={fieldClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Email</span>
          <input name="email" type="email" autoComplete="email" required defaultValue={f.email} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Phone / WhatsApp</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={f.phone} className={fieldClass} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Password</span>
          <input name="password" type="password" autoComplete="new-password" minLength={8} required className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Confirm password</span>
          <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={fieldClass} />
        </label>
      </div>
      <p className="text-[0.76rem] text-slate">At least 8 characters. Your account is ready immediately — no confirmation email.</p>
      <Submit pending={pending}>Create Account</Submit>
      <p className="text-center text-[0.86rem] text-slate">
        Already have an account?{" "}
        <Link href={`/account/login?next=${encodeURIComponent(next)}`} className="font-semibold text-blue hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  if (state?.saved) {
    return (
      <div role="status" className="space-y-3 text-center">
        <p className="font-heading text-[1.1rem] font-bold text-ink">Check your email</p>
        <p className="text-[0.9rem] text-slate">
          If an account exists for <strong className="text-ink">{state.fields?.email}</strong>, we&rsquo;ve sent a link to reset your password. It expires
          in 1 hour. Check your spam folder if it doesn&rsquo;t arrive within a few minutes.
        </p>
        <Link href="/account/login" className="inline-block text-[0.88rem] font-semibold text-blue hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <label className="block">
        <span className={labelClass}>Email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} className={fieldClass} />
      </label>
      <Submit pending={pending}>Send Reset Link</Submit>
      <p className="text-center text-[0.86rem] text-slate">
        Remembered it?{" "}
        <Link href="/account/login" className="font-semibold text-blue hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(setNewPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <ErrorBox state={state} />
      <label className="block">
        <span className={labelClass}>New password</span>
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={fieldClass} />
      </label>
      <label className="block">
        <span className={labelClass}>Confirm new password</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={fieldClass} />
      </label>
      <p className="text-[0.76rem] text-slate">At least 8 characters.</p>
      <Submit pending={pending}>Update Password</Submit>
    </form>
  );
}
