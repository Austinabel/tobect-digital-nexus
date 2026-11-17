import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { ProductGrid } from "@/components/marketing/product-grid";
import { CatalogueNotice } from "@/components/shop/catalogue-notice";
import { EmptyCatalogue } from "@/components/shop/empty-catalogue";
import { getCatalog } from "@/lib/catalog-server";
import { searchCatalog } from "@/lib/catalog";
import { IconSearch } from "@/components/icons";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const catalog = await getCatalog();
  const CATEGORIES = catalog.categories;
  const results = query ? searchCatalog(catalog, query) : [];
  const matchingCategories = query
    ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <>
      <PageHero kicker="Search" title={query ? <>Results for &ldquo;{query}&rdquo;</> : "Search Products"} crumbs={[{ label: "Search" }]}>
        <form action="/search" role="search" className="relative mt-6 max-w-[620px]">
          <label htmlFor="search-page-input" className="sr-only">
            Search products
          </label>
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate" />
          <input
            id="search-page-input"
            name="q"
            type="search"
            defaultValue={query}
            required
            placeholder="Try “inverter”, “lithium” or “550W”"
            className="h-13 w-full rounded-full border border-hair bg-white pl-12 pr-28 text-[1rem] text-ink outline-none focus:border-blue focus:ring-3 focus:ring-blue/15"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 h-10 -translate-y-1/2 rounded-full bg-blue px-5 font-heading text-[0.88rem] font-semibold text-white hover:bg-blue-deep"
          >
            Search
          </button>
        </form>
      </PageHero>

      <section className="bg-white py-8 lg:py-12">
        <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6 lg:px-9">
          {matchingCategories.length > 0 && (
            <p className="text-[0.9rem] text-slate">
              Categories:{" "}
              {matchingCategories.map((c, i) => (
                <span key={c.slug}>
                  {i > 0 && ", "}
                  <Link href={`/shop/${c.slug}`} className="font-semibold text-blue hover:underline">
                    {c.name}
                  </Link>
                </span>
              ))}
            </p>
          )}
          {query && (
            <p className="text-[0.85rem] text-slate" aria-live="polite">
              {results.length} {results.length === 1 ? "product" : "products"} found
            </p>
          )}
          {results.length > 0 ? (
            <>
              <ProductGrid products={results} />
              <CatalogueNotice />
            </>
          ) : query ? (
            <EmptyCatalogue
              title="No products matched your search"
              message="Not everything we sell is listed online yet. Tell us what you're looking for and we'll check stock for you."
              whatsappMessage={`Hello Tobecat, I'm looking for: ${query}`}
            />
          ) : (
            <p className="text-slate">
              Type a product name, brand or power rating above, or{" "}
              <Link href="/shop" className="font-semibold text-blue hover:underline">
                browse the shop
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </>
  );
}
