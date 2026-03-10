import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import DevNavBar from "./components/DevNavBar";
import DevFooter from "./components/DevFooter";
import { AuthProviderWrapper } from "./components/AuthProviderWrapper";
import ScrollToTop from "@/components/ScrollToTop";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://developer.mesocrats.org"),
  title: {
    default:
      "PartyStack -- The Open Platform for American Political Technology",
    template: "%s | PartyStack",
  },
  description:
    "PartyStack is the open platform for American political technology. APIs, SDKs, and prompt libraries to build compliant, transparent, and accessible tools for democracy.",
  keywords: [
    "PartyStack",
    "political technology",
    "FEC compliance",
    "open source",
    "political API",
    "party formation",
    "Mesocratic Party",
  ],
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/developer/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/developer/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/developer/apple-touch-icon.png",
  },
  openGraph: {
    title: "PartyStack -- The Open Platform for American Political Technology",
    description:
      "Open-source APIs for FEC compliance, party formation, ballot access, and election calendars. Built by the Mesocratic National Committee.",
    url: "https://developer.mesocrats.org",
    siteName: "PartyStack",
    images: [
      {
        url: "/images/og-partystack.png",
        width: 1200,
        height: 630,
        alt: "PartyStack -- The Open Platform for American Political Technology",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@mesocrats",
    creator: "@mesocrats",
    title: "PartyStack -- The Open Platform for American Political Technology",
    description:
      "Open-source APIs for FEC compliance, party formation, and ballot access. Built by the Mesocratic National Committee. MIT License.",
    images: ["/images/og-partystack.png"],
  },
};

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${jetbrainsMono.variable} font-dev-sans bg-[#0A0A15] text-white min-h-screen flex flex-col`}
    >
      {/* Override html/body background to prevent white flash during overscroll */}
      <style>{`html,body{background:#101529!important}`}</style>
      <AuthProviderWrapper>
        <DevNavBar />
        <main className="flex-1 bg-[#101529]">{children}</main>
        <DevFooter />
        <ScrollToTop />
      </AuthProviderWrapper>
    </div>
  );
}
