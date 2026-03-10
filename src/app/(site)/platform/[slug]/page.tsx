// app/platform/[slug]/page.tsx

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { client } from '@/sanity/lib/client'
import { policyPageBySlugQuery, siteSettingsQuery } from '@/sanity/lib/queries'
import PortableTextRenderer from '@/components/PortableTextRenderer'
import LivingPlatformCallout from '@/components/LivingPlatformCallout'
import Link from 'next/link'
import type { Metadata } from 'next'
import { whitePaperConfig, type WhitePaperEntry } from '../whitePaperConfig'

// ── Types ─────────────────────────────────────────
interface PolicyPageData {
  _id: string
  title: string
  slug: { current: string }
  headline: string
  tagline: string
  icon: string
  category: string
  heroImage: string | null
  imageCredit: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  realitySection: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  othersSaySection: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whereWeStandSection: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  throughLineSection: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whatItMeansSection: any[]
  livingPlatformCallout: {
    useDefault: boolean
    customText?: string
  }
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

interface SiteSettingsData {
  livingPlatformHeadline: string
  livingPlatformBody: string
  livingPlatformCtas: Array<{ label: string; url: string }>
  fecDisclaimer: string
}

// ── Data Fetching ─────────────────────────────────
async function getPolicyPage(slug: string): Promise<PolicyPageData | null> {
  return client.fetch(
    policyPageBySlugQuery,
    { slug },
    { next: { revalidate: 60 } }
  )
}

async function getSiteSettings(): Promise<SiteSettingsData> {
  return client.fetch(
    siteSettingsQuery,
    {},
    { next: { revalidate: 60 } }
  )
}

// ── Static Params (for build-time generation) ─────
export async function generateStaticParams() {
  const pages = await client.fetch(
    `*[_type == "policyPage"]{ "slug": slug.current }`,
    {},
    { next: { revalidate: 60 } }
  )
  return pages.map((page: { slug: string }) => ({ slug: page.slug }))
}

// ── Dynamic Metadata ──────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const page = await getPolicyPage(params.slug)
  if (!page) return {}
  return {
    title: page.seo?.metaTitle || undefined,
    description: page.seo?.metaDescription || undefined,
  }
}

// ── Page Component ────────────────────────────────
export default async function PolicyPage({
  params,
}: {
  params: { slug: string }
}) {
  const [page, siteSettings] = await Promise.all([
    getPolicyPage(params.slug),
    getSiteSettings(),
  ])

  if (!page) notFound()

  return (
    <main className="scroll-smooth">
      {/* ── Hero ────────────────────────────────── */}
      <section className="relative py-20 md:py-32 bg-gray-900 text-white overflow-hidden">
        {page.heroImage && (
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
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Section label */}
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
            THE MESOCRATIC POSITION
          </p>
          {page.headline && (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4">
              {page.headline}
            </h1>
          )}
          {page.tagline && (
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              {page.tagline}
            </p>
          )}
          {whitePaperConfig[page.slug.current]?.length > 0 && (
            <a
              href="#white-papers"
              className="inline-block mt-6 border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
            >
              {whitePaperConfig[page.slug.current].length === 1
                ? 'Read the White Paper'
                : 'Read the White Papers'}
            </a>
          )}
          <Link
            href="/platform/policies"
            className="block mt-4 text-sm font-normal text-white no-underline hover:text-gray-300 transition-colors"
          >
            Explore Our Policies →
          </Link>
        </div>
        {page.imageCredit && (
          <span className="absolute bottom-2 right-3 text-[9px] text-white/50">
            {page.imageCredit}
          </span>
        )}
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      {/* ── Content ─────────────────────────────── */}
      <article className="max-w-4xl mx-auto px-6 py-10 sm:py-12">
        {/* THE REALITY */}
        {page.realitySection && (
          <section className="mb-12">
            <p className="text-base font-extrabold tracking-widest text-accent uppercase mb-6">
              THE REALITY
            </p>
            <PortableTextRenderer value={page.realitySection} />
          </section>
        )}

        {/* WHAT OTHERS SAY */}
        {page.othersSaySection && (
          <section className="mb-12">
            <p className="text-base font-extrabold tracking-widest text-accent uppercase mb-6">
              WHAT OTHERS SAY
            </p>
            <PortableTextRenderer value={page.othersSaySection} />
          </section>
        )}

        {/* WHERE WE STAND */}
        {page.whereWeStandSection && (
          <section className="mb-12">
            <p className="text-base font-extrabold tracking-widest text-accent uppercase mb-6">
              WHERE WE STAND
            </p>
            <PortableTextRenderer value={page.whereWeStandSection} />
          </section>
        )}

        {/* THE THROUGH LINE */}
        {page.throughLineSection && (
          <section className="mb-12">
            <p className="text-base font-extrabold tracking-widest text-accent uppercase mb-6">
              THE THROUGH LINE
            </p>
            <PortableTextRenderer value={page.throughLineSection} />
          </section>
        )}

        {/* WHAT IT MEANS FOR YOU */}
        {page.whatItMeansSection && (
          <section className="mb-12">
            <p className="text-base font-extrabold tracking-widest text-accent uppercase mb-6">
              WHAT IT MEANS FOR YOU
            </p>
            <PortableTextRenderer value={page.whatItMeansSection} />
          </section>
        )}

        {/* ── White Paper Callout ── */}
        {whitePaperConfig[page.slug.current]?.length === 1 && (
          <section id="white-papers" className="mb-16 bg-accent rounded-lg p-8 sm:p-10 text-white">
            <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/60">
              WHITE PAPER
            </p>
            <h3 className="text-2xl font-bold mb-2">
              Download the PDF
            </h3>
            <p className="text-white/80 leading-relaxed mb-6">
              {whitePaperConfig[page.slug.current][0].headline} — {whitePaperConfig[page.slug.current][0].subheadline}
            </p>
            <a
              href={whitePaperConfig[page.slug.current][0].pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-accent font-bold px-6 py-3 rounded hover:bg-gray-100 transition-colors"
            >
              Download the PDF
            </a>
          </section>
        )}
        {whitePaperConfig[page.slug.current]?.length > 1 && (() => {
          const papers = whitePaperConfig[page.slug.current];
          const countWords: Record<number, string> = { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten' };
          const countWord = countWords[papers.length] || String(papers.length);
          return (
            <section id="white-papers" className="mb-16 bg-accent rounded-lg p-8 sm:p-10 text-white">
              <p className="text-xs font-bold tracking-widest uppercase mb-3 text-white/60">
                WHITE PAPERS
              </p>
              <h3 className="text-2xl font-bold mb-2">
                Dive Deeper
              </h3>
              <p className="text-white/80 leading-relaxed mb-6">
                {countWord} white papers support this policy position.
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
                      Download the PDF
                    </a>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── Living Platform Callout ───────────── */}
        <LivingPlatformCallout
          headline={siteSettings.livingPlatformHeadline}
          body={
            page.livingPlatformCallout?.useDefault === false &&
            page.livingPlatformCallout?.customText
              ? page.livingPlatformCallout.customText
              : siteSettings.livingPlatformBody
          }
          ctas={siteSettings.livingPlatformCtas}
        />

        {/* ── FEC Disclaimer ────────────────────── */}
        {siteSettings.fecDisclaimer && (
          <p className="text-xs text-gray-400 text-center mt-12">
            {siteSettings.fecDisclaimer}
          </p>
        )}
      </article>
    </main>
  )
}
