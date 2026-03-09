import type { Metadata } from "next";
import Image from "next/image";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import LivingPlatformCallout from "@/components/LivingPlatformCallout";
import { client } from "@/sanity/lib/client";
import { pageBySlugQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import {
  whitePaperConfig,
  type WhitePaperEntry,
} from "../../platform/whitePaperConfig";

const papers = whitePaperConfig["permanent-panels"];
const countWords: Record<number, string> = {
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
};
const countWord = countWords[papers.length] || String(papers.length);

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "permanent-panels" },
    { next: { revalidate: 60 } }
  );
  return {
    title: page?.seo?.metaTitle || undefined,
    description: page?.seo?.metaDescription || undefined,
  };
}

export default async function PermanentPanelsPage() {
  const [page, siteSettings] = await Promise.all([
    client.fetch(pageBySlugQuery, { slug: "permanent-panels" }, { next: { revalidate: 60 } }),
    client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } }),
  ]);

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
            href="#white-papers"
            className="inline-block mt-6 border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
          >
            Read the White Papers
          </a>
        </div>
        {page?.imageCredit && (
          <span className="absolute bottom-2 right-3 text-[9px] text-white/50">
            {page.imageCredit}
          </span>
        )}
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Body content (rich text) */}
        {page?.content && page.content.length > 0 && (
          <PortableTextRenderer value={page.content} />
        )}

        {/* White Paper Cards */}
        <section id="white-papers" className="mt-16 mb-16 bg-accent rounded-lg p-8 sm:p-10 text-white">
          <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/60">
            WHITE PAPERS
          </p>
          <h3 className="text-2xl font-bold mb-2">
            Dive Deeper
          </h3>
          <p className="text-white/80 leading-relaxed mb-6">
            {countWord} white papers support this position.
          </p>
          <div className="flex flex-col gap-4">
            {papers.map((paper: WhitePaperEntry) => (
              <div key={paper.id} className="bg-white rounded-lg p-6 sm:p-8">
                <p className="text-xs font-bold tracking-widest uppercase text-accent/60 mb-2">
                  {paper.eyebrow}
                </p>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {paper.headline}
                </h4>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {paper.subheadline}
                </p>
                <a
                  href={paper.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-accent text-white font-bold px-6 py-3 rounded hover:bg-accent-light transition-colors"
                >
                  Download the White Paper (PDF)
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Living Platform Callout */}
        <LivingPlatformCallout
          headline={siteSettings?.livingPlatformHeadline}
          body={siteSettings?.livingPlatformBody}
          ctas={siteSettings?.livingPlatformCtas}
        />
      </div>
    </div>
  );
}
