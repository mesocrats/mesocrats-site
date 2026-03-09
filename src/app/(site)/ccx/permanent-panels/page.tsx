import type { Metadata } from "next";
import Image from "next/image";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import LivingPlatformCallout from "@/components/LivingPlatformCallout";
import { client } from "@/sanity/lib/client";
import { pageBySlugQuery, siteSettingsQuery } from "@/sanity/lib/queries";
import Link from "next/link";

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
          <p className="inline-block bg-white text-accent rounded-full px-3 py-1 text-sm uppercase tracking-[0.2em] font-extrabold mb-4">
            CONSTITUTIONAL CONVENTION X
          </p>
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
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link
              href="/ccx/permanent-panels/free-expression"
              className="border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
            >
              Free Expression Panel →
            </Link>
            <Link
              href="/ccx/permanent-panels/religion"
              className="border-2 border-white text-white bg-transparent font-bold px-5 py-2.5 text-sm rounded transition-colors hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white"
            >
              Religion Panel →
            </Link>
          </div>
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
