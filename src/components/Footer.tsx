import Link from "next/link";
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  type LucideIcon,
} from "lucide-react";
import { client } from "@/sanity/lib/client";
import { siteSettingsQuery } from "@/sanity/lib/queries";

/* ── Platform → icon mapping ── */
const socialIcons: Record<string, LucideIcon> = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
};

/* TikTok isn't in Lucide, so we use an inline SVG */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.83a4.84 4.84 0 0 1-1-.14Z" />
    </svg>
  );
}

/* ── Fallbacks ── */
const F = {
  footerColumns: [
    {
      heading: "About",
      links: [
        { label: "Our Idea", url: "/about/idea" },
        { label: "Our Story", url: "/about/story" },
        { label: "Leadership", url: "/about/leadership" },
        { label: "FAQ", url: "/about/faq" },
      ],
    },
    {
      heading: "Party",
      links: [
        { label: "Declaration", url: "/party/declaration" },
        { label: "Our Mission", url: "/party/mission" },
        { label: "Our Politics", url: "/party/politics" },
      ],
    },
    {
      heading: "Platform",
      links: [
        { label: "Overview", url: "/platform" },
        { label: "How It Works", url: "/platform/how-it-works" },
        { label: "Policy Positions", url: "/platform/policies" },
        { label: "PartyStack", url: "https://developer.mesocrats.org" },
      ],
    },
    {
      heading: "Get Involved",
      links: [
        { label: "Join", url: "/involved/join" },
        { label: "Volunteer", url: "/involved/volunteer" },
        { label: "Run for Office", url: "/candidates/run" },
        { label: "Donate", url: "/donate" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "CCX", url: "/ccx" },
        { label: "Research", url: "/research" },
        { label: "News", url: "/news" },
        { label: "Contact", url: "/contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms of Service", url: "/terms" },
        { label: "FEC Disclosures", url: "/disclosures" },
      ],
    },
  ],
  fecDisclaimer:
    "Paid for by the Mesocratic National Committee. Not authorized by any candidate or candidate\u2019s committee.",
};

interface FooterColumn {
  heading: string;
  links: { label: string; url: string }[];
}

interface SocialLink {
  platform: string;
  url: string;
  handle: string;
}

export default async function Footer() {
  const settings = await client.fetch(
    siteSettingsQuery,
    {},
    { next: { revalidate: 60 } }
  );

  const columns: FooterColumn[] =
    settings?.footerColumns && settings.footerColumns.length > 0
      ? settings.footerColumns
      : F.footerColumns;

  const fecDisclaimer = settings?.fecDisclaimer || F.fecDisclaimer;
  const copyrightText = settings?.copyrightText;
  const socialLinks: SocialLink[] = settings?.socialLinks || [];

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer link columns */}
        <div className="grid grid-cols-2 md:grid-cols-[repeat(6,auto)] gap-x-4 gap-y-8 md:gap-x-12 md:gap-y-0 md:justify-start mb-10">
          {columns.map((section) => (
            <div key={section.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">
                {section.heading}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.url}>
                    {link.url.startsWith("http") ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.url}
                        className="text-xs text-white/70 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex gap-5 mb-8">
            {socialLinks.map((social) => {
              const Icon = socialIcons[social.platform];
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {social.platform === "tiktok" ? (
                    <TikTokIcon className="h-5 w-5" />
                  ) : Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{social.handle || social.platform}</span>
                  )}
                </a>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* FEC Disclaimer */}
          <p className="text-xs text-white/50 leading-relaxed mb-4">
            {fecDisclaimer}
          </p>

          {/* Copyright */}
          <p className="text-xs text-white/40">
            {copyrightText || (
              <>
                &copy; {new Date().getFullYear()} The Mesocratic Party. All
                rights reserved.
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
