import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconArrowRight } from "@/components/icons";

const buttonVariants = cva(
  "group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 py-3 font-heading text-[0.92rem] font-semibold transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue",
  {
    variants: {
      variant: {
        red: "bg-red text-white shadow-[0_14px_26px_-14px_var(--color-red)] hover:bg-red-dark",
        navy: "bg-ink text-white hover:shadow-[0_20px_44px_-22px_rgba(13,27,47,0.35)]",
        "outline-blue": "border-2 border-[#c9d8f2] bg-white text-blue hover:border-blue",
        "outline-whatsapp": "border-2 border-[#bfe4cd] bg-white text-whatsapp hover:border-whatsapp",
        "outline-white": "border-2 border-white/55 bg-transparent text-white hover:border-white hover:bg-white/10",
        white: "bg-white text-blue-deep shadow-[0_14px_26px_-14px_rgba(0,0,0,0.4)] hover:bg-mist",
        "outline-whatsapp-dark":
          "border-2 border-[#3ddc84]/60 bg-[#0b1930]/30 text-[#7cebab] backdrop-blur-sm hover:border-[#3ddc84] hover:bg-[#0b1930]/50",
      },
    },
    defaultVariants: { variant: "red" },
  },
);

interface SiteButtonProps extends VariantProps<typeof buttonVariants> {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  trailingArrow?: boolean;
  className?: string;
}

export function SiteButton({ href, children, icon, trailingArrow, variant, className }: SiteButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);
  const content = (
    <>
      {icon}
      {children}
      {trailingArrow && <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  // External destinations (WhatsApp, etc.) open in a new tab; internal ones use client navigation.
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
