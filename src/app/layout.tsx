import type { Metadata, Viewport } from "next";
import { Sora, Manrope, Caveat, Geist_Mono } from "next/font/google";
import { getSite } from "@/lib/site-server";
import "./globals.css";

const heading = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Site-wide titles and descriptions come from Admin → Site settings. */
export async function generateMetadata(): Promise<Metadata> {
  const SITE = await getSite();
  const title = `${SITE.name} | ${SITE.tagline}`;
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s | ${SITE.name}` },
    description: SITE.description,
    applicationName: SITE.name,
    openGraph: { type: "website", locale: "en_NG", url: "/", siteName: SITE.name, title, description: SITE.description },
    twitter: { card: "summary_large_image", title, description: SITE.description },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#1556d9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} ${script.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
