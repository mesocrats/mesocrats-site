import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  metadataBase: new URL("https://mesocrats.org"),
  title: {
    default: "The Mesocratic Party -- America Meets Here",
    template: "%s | The Mesocratic Party",
  },
  description:
    "The Mesocratic Party believes the middle class is the greatest invention in American history. We exist to protect it, grow it, and hold the middle ground that keeps this country together.",
  keywords: [
    "Mesocratic Party",
    "centrist",
    "middle class",
    "political party",
    "CCX",
    "Constitutional Convention X",
    "American politics",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    title: "The Mesocratic Party -- America Meets Here",
    description:
      "The middle class is the greatest invention in American history. We exist to protect it, grow it, and hold the middle ground.",
    url: "https://mesocrats.org",
    siteName: "The Mesocratic Party",
    images: [
      {
        url: "/images/og-mesocrats.png",
        width: 1200,
        height: 630,
        alt: "The Mesocratic Party -- America Meets Here",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mesocrats",
    creator: "@mesocrats",
    title: "The Mesocratic Party -- America Meets Here",
    description:
      "The middle class is the greatest invention in American history. We exist to protect it, grow it, and hold the middle ground.",
    images: ["/images/og-mesocrats.png"],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
