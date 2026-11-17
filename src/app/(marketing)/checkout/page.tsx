import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { CheckoutForm, type CheckoutDefaults } from "@/components/shop/checkout-form";
import { supabaseServer } from "@/lib/supabase/server";
import { onlinePaymentEnabled } from "@/lib/payments/paystack";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  let defaults: CheckoutDefaults = {};
  if (data.user) {
    const { data: profile } = await supabase.from("customer_profiles").select("full_name, phone, delivery_address, city, state").eq("id", data.user.id).maybeSingle();
    defaults = { ...profile, email: data.user.email };
  }

  return (
    <>
      <PageHero kicker="Secure Checkout" title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <section className="bg-mist/50 py-8 lg:py-12">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <CheckoutForm signedIn={Boolean(data.user)} defaults={defaults} onlinePayment={onlinePaymentEnabled()} />
        </div>
      </section>
    </>
  );
}
