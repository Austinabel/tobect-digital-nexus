import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { WishlistView } from "@/components/shop/wishlist-view";

export const metadata: Metadata = {
  title: "Saved Items",
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <>
      <PageHero kicker="Your list" title="Saved Items" intro="Products you've saved on this device." crumbs={[{ label: "Shop", href: "/shop" }, { label: "Saved Items" }]} />
      <section className="bg-white py-8 lg:py-12">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <WishlistView />
        </div>
      </section>
    </>
  );
}
