import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { SocialAuthProviderWrapper } from "./components/SocialAuthProvider";
import SocialNavBar from "./components/SocialNavBar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Social Portal -- Mesocratic National Committee",
    template: "%s | MNC Social",
  },
  description:
    "Social media management platform for the Mesocratic National Committee.",
};

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.className} bg-[#0B0F1A] text-white min-h-screen`}
    >
      <SocialAuthProviderWrapper>
        <SocialNavBar />
        <main>{children}</main>
      </SocialAuthProviderWrapper>
    </div>
  );
}
