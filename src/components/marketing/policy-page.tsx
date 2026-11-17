import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose } from "@/components/marketing/prose";
import { RichText } from "@/components/marketing/rich-text";
import { getPolicy } from "@/lib/content-server";
import { getSite } from "@/lib/site-server";

type PolicyKey = "warranty" | "terms" | "privacy" | "returns" | "delivery";

const KICKER: Record<PolicyKey, string> = { warranty: "Warranty", returns: "Returns & refunds", delivery: "Delivery", terms: "Legal", privacy: "Legal" };

export async function policyMetadata(key: PolicyKey, path: string): Promise<Metadata> {
  const p = await getPolicy(key);
  return { title: p.title, ...(p.summary && { description: p.summary }), alternates: { canonical: path } };
}

/** A policy page written in Admin → Pages. A policy with no text yet is not published (404). */
export async function PolicyPage({ policy }: { policy: PolicyKey }) {
  const [p, site] = await Promise.all([getPolicy(policy), getSite()]);
  if (!p.body.trim()) notFound();
  return (
    <>
      <PageHero kicker={KICKER[policy]} title={p.title} crumbs={[{ label: p.title }]} />
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-9">
          <Prose>
            <RichText text={p.body} site={site} />
          </Prose>
        </div>
      </section>
    </>
  );
}
