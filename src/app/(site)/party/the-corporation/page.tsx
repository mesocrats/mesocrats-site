import type { Metadata } from "next";
import Image from "next/image";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import LivingPlatformCallout from "@/components/LivingPlatformCallout";
import { client } from "@/sanity/lib/client";
import { pageBySlugQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import { whitePaperConfig } from "@/app/(site)/platform/whitePaperConfig";

const paper = whitePaperConfig["the-corporation"][0];

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "the-corporation" },
    { next: { revalidate: 60 } }
  );
  return {
    title: page?.seo?.metaTitle || paper.headline,
    description: page?.seo?.metaDescription || paper.subheadline,
  };
}

export default async function TheCorporationPage() {
  const [page, siteSettings] = await Promise.all([
    client.fetch(pageBySlugQuery, { slug: "the-corporation" }, { next: { revalidate: 60 } }),
    client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } }),
  ]);

  return (
    <main className="scroll-smooth">
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
            <span className="inline-block bg-white text-accent rounded-full px-3 py-1 text-sm font-bold tracking-wide uppercase mb-4">
              {page.heroEyebrow}
            </span>
          )}
          {page?.heroHeadline && (
            <h1 className="text-5xl sm:text-7xl font-bold mb-4">
              {page.heroHeadline}
            </h1>
          )}
          {page?.heroSubheadline && (
            <p className="text-lg font-semibold text-white/90 mb-8">
              {page.heroSubheadline}
            </p>
          )}
          <a
            href="#white-paper"
            className="inline-block mt-6 border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
          >
            Read the White Paper
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

      {/* Content */}
      {page?.content && page.content.length > 0 && (
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <PortableTextRenderer value={page.content} />
        </article>
      )}

      {/* White Paper Callout */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <div id="white-paper" className="bg-accent rounded-lg p-8 sm:p-10 text-white">
            <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/60">
              WHITE PAPER
            </p>
            <h3 className="text-2xl font-bold mb-2">
              Download the PDF
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {paper.headline} -- {paper.subheadline}
            </p>
            <a
              href={paper.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-accent font-bold px-6 py-3 rounded hover:bg-gray-100 transition-colors"
            >
              Download the PDF
            </a>
          </div>
        </div>
      </section>

      {/* Living Platform Callout */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-3xl mx-auto">
          <LivingPlatformCallout
            headline={siteSettings?.livingPlatformHeadline}
            body={siteSettings?.livingPlatformBody}
            ctas={siteSettings?.livingPlatformCtas}
          />
        </div>
      </section>
    </main>
  );
}
