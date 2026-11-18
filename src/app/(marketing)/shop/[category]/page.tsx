import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { CategoryNav } from "@/components/shop/category-nav";
import { Catalogue } from "@/components/shop/catalogue";
import { ShopPromoTiles, ShopTrustBar } from "@/components/shop/shop-bottom";
import { getCatalog } from "@/lib/catalog-server";
import { SETUPS_CATEGORY, findCategory, subcategoriesOf } from "@/lib/catalog";
import { KitsSection } from "@/components/shop/kits-section";
import Link from "next/link";
import { catalogueSearch, hasActiveFilters, parseCatalogueQuery } from "@/lib/shop/catalogue-query";
import { getSite } from "@/lib/site-server";

// Categories come from the database (managed in the admin), so pages render on request.

export async function generateMetadata(props: PageProps<"/shop/[category]">): Promise<Metadata> {
  const SITE = await getSite();
  const { category: slug } = await props.params;
  const category = findCategory(await getCatalog(), slug);
  if (!category) return {};
  const query = parseCatalogueQuery(await props.searchParams);
  const filtered = hasActiveFilters(query);
  return {
    title: `${category.name} in Nigeria`,
    description: `Shop ${category.name.toLowerCase()} from ${SITE.name} — genuine products, supply, delivery and professional installation across Nigeria.`,
    alternates: { canonical: `/shop/${category.slug}${filtered ? "" : catalogueSearch({ ...query, sort: "featured", view: "grid" })}` },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage(props: PageProps<"/shop/[category]">) {
  const SITE = await getSite();
  const { category: slug } = await props.params;
  const catalog = await getCatalog();
  const category = findCategory(catalog, slug);
  if (!category) notFound();
  const parent = category.parent ? findCategory(catalog, category.parent) : undefined;
  // subcategories of this category, or the siblings when viewing a subcategory
  const subs = subcategoriesOf(catalog, parent?.slug ?? category.slug);
  const query = parseCatalogueQuery(await props.searchParams);

  return (
    <>
      <PageHero
        kicker="Shop by Category"
        title={category.name}
        intro={`Genuine ${category.name.toLowerCase()} supplied, delivered and installed by ${SITE.name}.`}
        crumbs={[{ label: "Shop", href: "/shop" }, ...(parent ? [{ label: parent.name, href: `/shop/${parent.slug}` }] : []), { label: category.name }]}
      />
      <CategoryNav active={parent?.slug ?? category.slug} />
      {subs.length > 0 && (
        <nav aria-label={`${(parent ?? category).name} types`} className="border-b border-hair bg-white">
          <ul className="mx-auto flex max-w-[1240px] flex-wrap gap-2 px-4 py-3 sm:px-6 lg:px-9">
            {[parent ?? category, ...subs].map((c, i) => {
              const on = c.slug === category.slug;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/shop/${c.slug}`}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex h-9 items-center rounded-full border px-4 text-[0.84rem] font-semibold transition-colors ${on ? "border-blue bg-blue text-white" : "border-hair bg-white text-ink hover:border-blue hover:text-blue"}`}
                  >
                    {i === 0 ? `All ${c.name}` : c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
      {category.slug === SETUPS_CATEGORY && <KitsSection showAllLink={false} />}
      <Catalogue query={query} basePath={`/shop/${category.slug}`} lockedCategory={category.slug} title={category.name} />
      <ShopTrustBar />
      <ShopPromoTiles hasNewArrivals={false} hasDeals={false} />
    </>
  );
}
