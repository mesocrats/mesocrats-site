import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import LivingPlatformCallout from "@/components/LivingPlatformCallout";
import { client } from "@/sanity/lib/client";
import { pageBySlugQuery } from "@/sanity/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "how-it-works" },
    { next: { revalidate: 60 } }
  );
  return {
    title: page?.seo?.metaTitle || undefined,
    description: page?.seo?.metaDescription || undefined,
  };
}

export default async function HowItWorksPage() {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "how-it-works" },
    { next: { revalidate: 60 } }
  );

  const hasCmsContent = page?.content && page.content.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections = page?.sections as any[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctaSection = sections?.find((s: any) => s._type === "ctaSection");

  return (
    <div className="scroll-smooth">
      {/* Hero */}
      <section className="relative bg-accent text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {page?.heroImage && (
          <>
            <Image
              src={page.heroImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative max-w-3xl mx-auto text-center">
          {page?.heroHeadline && (
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              {page.heroHeadline}
            </h1>
          )}
          {page?.heroSubheadline && (
            <p className="text-lg font-semibold text-white/90 leading-relaxed">
              {page.heroSubheadline}
            </p>
          )}
          <a
            href="#white-paper"
            className="inline-block mt-6 border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
          >
            Read the White Paper
          </a>
          <Link
            href="/platform/policies"
            className="block mt-4 text-sm font-normal text-white no-underline hover:text-gray-300 transition-colors"
          >
            Explore Our Policies →
          </Link>
        </div>
        {page?.imageCredit && (
          <span className="absolute bottom-2 right-3 text-[9px] text-white/50">
            {page.imageCredit}
          </span>
        )}
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-16">
        {hasCmsContent && (
          <PortableTextRenderer value={page.content} />
        )}

        {/* CTAs */}
        {ctaSection && (
          <section className="text-center space-y-4">
            {ctaSection.ctaLink && ctaSection.ctaLabel && (
              <Link
                href={ctaSection.ctaLink}
                className="inline-block bg-accent hover:bg-accent-light text-white font-bold px-8 py-3 rounded transition-colors"
              >
                {ctaSection.ctaLabel}
              </Link>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {ctaSection.secondaryLink && ctaSection.secondaryLabel && (
                <Link
                  href={ctaSection.secondaryLink}
                  className="text-secondary font-semibold hover:underline"
                >
                  {ctaSection.secondaryLabel}
                </Link>
              )}
              {ctaSection.linkUrl && ctaSection.linkText && (
                <Link
                  href={ctaSection.linkUrl}
                  className="text-secondary font-semibold hover:underline"
                >
                  {ctaSection.linkText}
                </Link>
              )}
            </div>
          </section>
        )}

        {/* ── White Paper Callout ── */}
        <section id="white-paper" className="mb-16 bg-accent rounded-lg p-8 sm:p-10 text-white">
          <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/60">
            WHITE PAPER
          </p>
          <h3 className="text-2xl font-bold mb-2">
            Read the Full White Paper
          </h3>
          <p className="text-white/80 leading-relaxed mb-6">
            How We Built the Platform — The Research, Methodology, and Strategic
            Framework Behind the Mesocratic Party&apos;s Policy Positions
          </p>
          <Link
            href="/platform/how-it-works/white-paper"
            className="inline-block bg-white text-accent font-bold px-6 py-3 rounded hover:bg-gray-100 transition-colors"
          >
            Read the White Paper
          </Link>
        </section>

        {/* ── Living Platform Callout ── */}
        <LivingPlatformCallout
          headline="THIS IS A LIVING PLATFORM"
          body="The position on this page is a starting point — not the final word. The Mesocratic Party's platform is written, debated, and ratified by its members at Constitutional Convention X, held annually in New Orleans every May. Between conventions, members shape the agenda through year-round digital engagement. These positions will evolve as the party grows. That's not a weakness. It's the whole point."
          ctas={[
            { label: "Join the Party", url: "/involved/join" },
            { label: "Submit an Idea", url: "/ccx/ideas" },
            { label: "Learn about CCX", url: "/ccx" },
            { label: "How Our Platform Works", url: "/platform/how-it-works" },
          ]}
        />
      </div>
    </div>
  );
}
