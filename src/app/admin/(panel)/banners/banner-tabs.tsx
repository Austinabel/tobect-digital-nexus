import Link from "next/link";
import { cn } from "@/lib/utils";

export function BannerTabs({ current }: { current: "banners" | "archived" | "slides" }) {
  return (
    <nav aria-label="Banner sections" className="mb-4 flex flex-wrap gap-1.5">
      {[
        ["banners", "Shop banners", "/admin/banners"],
        ["slides", "Homepage slideshow", "/admin/banners/home-slides"],
        ["archived", "Archived", "/admin/banners?view=archived"],
      ].map(([k, label, href]) => (
        <Link key={k} href={href} aria-current={current === k ? "page" : undefined} className={cn("rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold", current === k ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
