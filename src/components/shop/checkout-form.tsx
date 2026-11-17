"use client";

import Link from "next/link";
import { useActionState, useCallback, useMemo, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/data/products";
import { findKit, kitCatalogueFrom } from "@/lib/data/kits";
import { useCatalog } from "@/components/catalog-provider";
import { findProduct } from "@/lib/catalog";
import { describeKitConfig, normaliseKitConfig, priceKit } from "@/lib/shop/kits";
import { placeOrder } from "@/app/(marketing)/checkout/actions";
import { fieldClass, labelClass } from "@/components/account/auth-forms";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { IconCheck, IconInfo } from "@/components/icons";

const noopSubscribe = () => () => {};

export interface CheckoutDefaults {
  full_name?: string;
  email?: string;
  phone?: string;
  delivery_address?: string | null;
  city?: string | null;
  state?: string | null;
}

export function CheckoutForm({ signedIn, defaults, onlinePayment }: { signedIn: boolean; defaults: CheckoutDefaults; onlinePayment: boolean }) {
  // Live catalogue (from the database), shared via <CatalogProvider>.
  const catalog = useCatalog();
  const kitCatalogue = useMemo(() => kitCatalogueFrom(catalog.products), [catalog]);
  const getProduct = useCallback((slug: string) => findProduct(catalog, slug), [catalog]);
  const { lines } = useCart();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [state, action, pending] = useActionState(placeOrder, undefined);

  // Display-only summary; the server re-prices everything when the order is placed.
  const summary = useMemo(
    () =>
      lines.flatMap((l) => {
        if (l.kit) {
          const kit = findKit(catalog.kits, l.slug);
          if (!kit) return [];
          const config = normaliseKitConfig(kit, l.kit);
          const p = priceKit(kit, config, kitCatalogue);
          return [{ id: l.id, name: kit.name, quantity: l.quantity, total: p.totalNgn * l.quantity, parts: describeKitConfig(kit, config, kitCatalogue), unpriced: p.hasUnpricedParts }];
        }
        const p = getProduct(l.slug);
        return p ? [{ id: l.id, name: p.name, quantity: l.quantity, total: p.priceNgn * l.quantity, parts: [] as string[], unpriced: false }] : [];
      }),
    [lines, getProduct, kitCatalogue, catalog.kits],
  );
  const subtotal = summary.reduce((s, i) => s + i.total, 0);
  const unpriced = summary.some((i) => i.unpriced);
  const canPayOnline = onlinePayment && !unpriced;
  const cartJson = JSON.stringify(lines.map((l) => ({ slug: l.slug, quantity: l.quantity, ...(l.kit ? { kit: l.kit } : {}) })));

  if (!hydrated) return <div className="h-96 animate-pulse rounded-3xl bg-field" aria-label="Loading checkout" />;

  if (!summary.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[#c9d8f2] bg-white px-6 py-14 text-center">
        <h2 className="font-heading text-[1.2rem] font-bold text-ink">Your cart is empty</h2>
        <Link href="/shop" className="mt-5 inline-flex h-12 items-center rounded-full bg-red px-7 font-heading text-[0.92rem] font-semibold text-white hover:bg-red-dark">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <input type="hidden" name="cart" value={cartJson} />
      <div className="space-y-6 rounded-3xl border border-hair bg-white p-5 sm:p-7">
        {state?.error && (
          <div role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">
            <p className="font-semibold">{state.error}</p>
            {state.errors && (
              <ul className="mt-1 list-disc pl-5">
                {state.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <fieldset>
          <legend className="font-heading text-[1.05rem] font-bold text-ink">Contact details</legend>
          {!signedIn && (
            <p className="mt-1 text-[0.82rem] text-slate">
              Checking out as a guest ·{" "}
              <Link href="/account/login?next=/checkout" className="font-semibold text-blue hover:underline">
                sign in instead
              </Link>
            </p>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Full name *</span>
              <input name="full_name" autoComplete="name" required defaultValue={defaults.full_name} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Phone / WhatsApp *</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={defaults.phone} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Email {canPayOnline ? "(needed for online payment)" : "(for your receipt)"}</span>
              <input name="email" type="email" autoComplete="email" defaultValue={defaults.email} className={fieldClass} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-[1.05rem] font-bold text-ink">Delivery address</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Street address *</span>
              <input name="delivery_address" autoComplete="street-address" required defaultValue={defaults.delivery_address ?? ""} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>City / Town *</span>
              <input name="city" autoComplete="address-level2" required defaultValue={defaults.city ?? ""} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>State *</span>
              <select name="state" required defaultValue={defaults.state ?? ""} className={fieldClass}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className={labelClass}>Order notes (optional)</span>
              <textarea name="notes" rows={3} placeholder="Landmark, preferred delivery time, installation needs…" className="w-full rounded-xl border border-hair bg-white px-3.5 py-3 text-[0.92rem] text-ink outline-none focus:border-blue focus:ring-3 focus:ring-blue/15" />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-heading text-[1.05rem] font-bold text-ink">Payment</legend>
          <div className="mt-3 grid gap-2.5">
            {canPayOnline && (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] border-hair p-4 has-[:checked]:border-blue has-[:checked]:bg-mist">
                <input type="radio" name="payment_method" value="paystack" defaultChecked className="mt-1 accent-[var(--color-blue)]" />
                <span>
                  <span className="block font-semibold text-ink">Pay online now</span>
                  <span className="block text-[0.82rem] text-slate">Card, bank transfer or USSD through Paystack&rsquo;s secure page.</span>
                </span>
              </label>
            )}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] border-hair p-4 has-[:checked]:border-blue has-[:checked]:bg-mist">
              <input type="radio" name="payment_method" value="pay-on-confirmation" defaultChecked={!canPayOnline} className="mt-1 accent-[var(--color-blue)]" />
              <span>
                <span className="block font-semibold text-ink">Pay after we confirm your order</span>
                <span className="block text-[0.82rem] text-slate">We confirm stock and delivery first, then send payment details.</span>
              </span>
            </label>
            {onlinePayment && unpriced && (
              <p className="flex gap-2 text-[0.78rem] text-slate">
                <IconInfo className="mt-px size-4 shrink-0" />
                Online payment opens once kit accessories are priced — we&rsquo;ll confirm the full total first.
              </p>
            )}
          </div>
        </fieldset>
      </div>

      <aside className="rounded-3xl border border-hair bg-white p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-heading text-[1.1rem] font-bold text-ink">Your order</h2>
        <ul className="mt-3 divide-y divide-hair text-[0.86rem]">
          {summary.map((i) => (
            <li key={i.id} className="py-2.5">
              <div className="flex justify-between gap-3">
                <span className="text-ink">
                  {i.quantity} × {i.name}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">{formatNaira(i.total)}</span>
              </div>
              {i.parts.length > 0 && <p className="mt-0.5 text-[0.76rem] text-slate">{i.parts.join(" · ")}</p>}
            </li>
          ))}
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-hair pt-3">
          <span className="text-slate">Subtotal</span>
          <span className="font-heading text-[1.4rem] font-extrabold tabular-nums text-ink">{formatNaira(subtotal)}</span>
        </div>
        <p className="mt-1 text-[0.76rem] text-slate">Delivery is confirmed with you{unpriced ? ", with kit accessories" : ""}. Prices are re-checked when you place the order.</p>
        <button
          type="submit"
          disabled={pending}
          className={cn("mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-red font-heading text-[1rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] transition-colors hover:bg-red-dark disabled:opacity-60")}
        >
          <IconCheck className="size-[18px]" />
          {pending ? "Placing order…" : "Place Order"}
        </button>
        <p className="mt-3 text-center text-[0.74rem] leading-snug text-slate">
          By placing your order you agree to our{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-blue underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/returns" target="_blank" className="font-semibold text-blue underline">
            Refund &amp; Returns Policy
          </Link>
          .
        </p>
        <Link href="/cart" className="mt-3 block text-center text-[0.84rem] font-semibold text-blue hover:underline">
          &larr; Back to cart
        </Link>
      </aside>

      {/* phones & tablets: total + Place Order fixed to the bottom of the screen */}
      <div className="shop-actionbar fixed inset-x-0 bottom-0 z-[65] border-t border-hair bg-white/95 px-4 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_-16px_rgba(13,27,47,0.35)] backdrop-blur-md print:hidden lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0">
            <span className="block text-[0.76rem] text-slate">Subtotal</span>
            <span className="block font-heading text-[1.15rem] font-extrabold tabular-nums text-ink">{formatNaira(subtotal)}</span>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="ml-auto inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-red px-6 font-heading text-[0.95rem] font-semibold text-white shadow-[0_14px_26px_-14px_var(--color-red)] hover:bg-red-dark disabled:opacity-60"
          >
            <IconCheck className="size-[18px]" />
            {pending ? "Placing order…" : "Place Order"}
          </button>
        </div>
      </div>
    </form>
  );
}
