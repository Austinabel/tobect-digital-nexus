import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { CartView } from "@/components/shop/cart-view";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <>
      <PageHero kicker="Cart" title="Your Cart" crumbs={[{ label: "Cart" }]} />
      <section className="bg-mist/50 py-8 lg:py-12">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <CartView />
        </div>
      </section>
    </>
  );
}
