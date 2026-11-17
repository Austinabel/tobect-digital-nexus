import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Readable long-form text styles for info / legal pages (no typography plugin needed). */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-[72ch] text-[1rem] leading-relaxed text-slate",
        "[&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:font-heading [&_h2]:text-[1.35rem] [&_h2]:font-bold [&_h2]:text-ink first:[&_h2]:mt-0",
        "[&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-[1.05rem] [&_h3]:font-semibold [&_h3]:text-ink",
        "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
        "[&_a]:font-semibold [&_a]:text-blue [&_a:hover]:underline [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
