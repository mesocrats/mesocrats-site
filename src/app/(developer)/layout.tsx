import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import DevNavBar from "./components/DevNavBar";
import DevFooter from "./components/DevFooter";
import { AuthProviderWrapper } from "./components/AuthProviderWrapper";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default:
      "PartyStack -- The Open Platform for American Political Technology",
    template: "%s | PartyStack",
  },
  description:
    "PartyStack is the open platform for American political technology. APIs, SDKs, and prompt libraries to build compliant, transparent, and accessible tools for democracy.",
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
    images: [{ url: "/images/partystack-logo-og.png", width: 400, height: 326 }],
    type: "website",
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
      <style>{`html,body{background:#0A0A15!important}`}</style>
      <AuthProviderWrapper>
        <DevNavBar />
        <main className="flex-1">{children}</main>
        <DevFooter />
      </AuthProviderWrapper>
    </div>
  );
}
