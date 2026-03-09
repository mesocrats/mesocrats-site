import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import { client } from "@/sanity/lib/client";
import { pageBySlugQuery } from "@/sanity/lib/queries";
import { splitContentByVisualMarkers } from "@/lib/splitContentByVisualMarkers";
import { whitePaperConfig } from "@/app/(site)/platform/whitePaperConfig";
import PolitiverseRadarChart from "@/components/politics/PolitiverseRadarChart";
import SpectrumComparison from "@/components/politics/SpectrumComparison";
import PositionMap from "@/components/politics/PositionMap";

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "politics" },
    { next: { revalidate: 60 } }
  );
  return {
    title: page?.seo?.metaTitle || undefined,
    description: page?.seo?.metaDescription || undefined,
  };
}
export default async function PoliticsPage() {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "politics" },
    { next: { revalidate: 60 } }
  );
  const hasCmsContent = page?.content && page.content.length > 0;

  const segments = hasCmsContent
    ? splitContentByVisualMarkers(page.content)
    : [];

  const visualComponents = [
    <PolitiverseRadarChart key="radar" />,
    <SpectrumComparison key="spectrum" />,
    <PositionMap key="position-map" />,
  ];

  return (
    <div>
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
          {page?.heroEyebrow && (
            <p className="inline-block bg-white text-accent rounded-full px-3 py-1 text-sm uppercase tracking-[0.2em] font-extrabold mb-4">
              {page.heroEyebrow}
            </p>
          )}
          {page?.heroHeadline && (
            <h1 className="text-5xl sm:text-7xl font-bold mb-4">
              {page.heroHeadline}
            </h1>
          )}
          {page?.heroSubheadline && (
            <p className="text-lg font-semibold text-white/90">
              {page.heroSubheadline}
            </p>
          )}
          {whitePaperConfig["politics"]?.length > 0 && (
            <a
              href="#white-papers"
              className="inline-block mt-6 border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
            >
              Read the White Paper
            </a>
          )}
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

      {hasCmsContent && (
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-12">
          {segments.map((segment, i) => (
            <div key={i}>
              {segment.length > 0 && (
                <PortableTextRenderer value={segment} />
              )}
              {i < segments.length - 1 && i < visualComponents.length &&
                visualComponents[i]}
            </div>
          ))}
        </article>
      )}

      {/* ── White Paper Callout ── */}
      {whitePaperConfig["politics"]?.length === 1 && (
        <section id="white-papers" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-accent rounded-lg p-8 sm:p-10 text-white">
            <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/60">
              {whitePaperConfig["politics"][0].eyebrow}
            </p>
            <h3 className="text-2xl font-bold mb-2">
              Read the Full White Paper
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {whitePaperConfig["politics"][0].headline} — {whitePaperConfig["politics"][0].subheadline}
            </p>
            <a
              href={whitePaperConfig["politics"][0].pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-accent font-bold px-6 py-3 rounded hover:bg-gray-100 transition-colors"
            >
              Read the White Paper
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
