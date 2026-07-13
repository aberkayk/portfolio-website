import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { OWNER_CONTEXT } from "@/lib/chat/context";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";

const headingFont = Space_Grotesk({
  variable: "--font-heading-sans",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Ahmet Berkay Koçak",
    "Software Engineer",
    "Full-Stack Developer",
    "Frontend Developer",
    "React Developer",
    "Next.js Developer",
    "Portfolio",
    "Istanbul",
    "Hybrid Athlete",
  ],
  authors: [{ name: SITE_NAME, url: `https://${OWNER_CONTEXT.contact.linkedin}` }],
  creator: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: OWNER_CONTEXT.name,
  url: SITE_URL,
  jobTitle: OWNER_CONTEXT.title,
  description: OWNER_CONTEXT.summary,
  email: `mailto:${OWNER_CONTEXT.contact.email}`,
  sameAs: [
    `https://${OWNER_CONTEXT.contact.linkedin}`,
    `https://${OWNER_CONTEXT.contact.github}`,
    "https://instagram.com/ahmettkocak",
  ],
  knowsAbout: OWNER_CONTEXT.skills,
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: OWNER_CONTEXT.education.school,
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
