import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const headingFont = Space_Grotesk({
  variable: "--font-heading-sans",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ahmet Berkay Koçak — Frontend Engineer & Hybrid Athlete",
  description:
    "Personal portfolio of Ahmet Berkay Koçak — full-stack software developer with 4+ years of experience and a hybrid athlete mindset.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
