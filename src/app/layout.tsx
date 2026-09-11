import type { Metadata } from "next";
import { Sora, Manrope, Caveat, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: "Tobecat Technologies | Powering the Future with Renewable Energy",
    template: "%s | Tobecat Technologies",
  },
  description:
    "Tobecat Technologies Nigeria Limited supplies and installs solar panels, inverters, lithium batteries, solar generators, CCTV and security systems for homes and businesses across Nigeria.",
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
