import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import { client } from "@/sanity/lib/client";
import { pageBySlugQuery } from "@/sanity/lib/queries";
import ConventionForm from "./ConventionForm";

const CCX_DATE = new Date("2027-05-01T00:00:00-05:00");

export async function generateMetadata(): Promise<Metadata> {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "convention" },
    { next: { revalidate: 60 } }
  );
  return {
    title: page?.seo?.metaTitle || undefined,
    description: page?.seo?.metaDescription || undefined,
  };
}

export default async function ConventionPage() {
  const page = await client.fetch(
    pageBySlugQuery,
    { slug: "convention" },
    { next: { revalidate: 60 } }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sections = page?.sections as any[] | undefined;

  // Text sections (Why New Orleans, What Is CCX, 5000 Delegates)
  const textSections =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections?.filter((s: any) => s._type === "textSection") || [];

  // CTA section for the registration area
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctaSection = sections?.find((s: any) => s._type === "ctaSection");

  // Background classes for alternating text sections
  const textBgs = ["", "bg-gray-light", ""];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
        <div className="relative max-w-4xl mx-auto text-center">
          {page?.heroEyebrow && (
            <p className="inline-block bg-white text-accent rounded-full px-3 py-1 text-sm uppercase tracking-[0.2em] font-extrabold mb-4">
              {page.heroEyebrow}
            </p>
          )}
          {page?.heroHeadline && (
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6">
              {page.heroHeadline}
            </h1>
          )}
          {page?.heroSubheadline && (
            <p className="text-lg font-semibold text-white/90 max-w-2xl mx-auto mb-10">
              {page.heroSubheadline}
            </p>
          )}
          <CountdownTimer target={CCX_DATE} className="justify-center mb-10" />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {page?.heroCta1Link && page?.heroCta1Label && (
              <a
                href={page.heroCta1Link}
                className="bg-secondary hover:bg-secondary-light text-white font-bold px-8 py-3 rounded transition-colors text-center"
              >
                {page.heroCta1Label}
              </a>
            )}
            {page?.heroCta2Link && page?.heroCta2Label && (
              <Link
                href={page.heroCta2Link}
                className="border-2 border-white/30 text-white font-semibold px-8 py-3 rounded hover:bg-white/10 transition-colors text-center"
              >
                {page.heroCta2Label}
              </Link>
            )}
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

      {/* Body content (rich text) */}
      {page?.content && page.content.length > 0 && (
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <PortableTextRenderer value={page.content} />
          </div>
        </section>
      )}

      {/* Text sections: Why New Orleans, What Is CCX, 5000 Delegates */}
      {textSections.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (section: any, i: number) => {
          const bg = textBgs[i] ?? "";
          const isPortableText = Array.isArray(section.body);

          return (
            <section
              key={section._key || i}
              className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 ${bg}`}
            >
              <div className="max-w-3xl mx-auto">
                {section.headline && (
                  <h2 className="text-3xl font-bold mb-6">
                    {section.headline}
                  </h2>
                )}
                {isPortableText ? (
                  <PortableTextRenderer value={section.body} />
                ) : (
                  section.body &&
                    section.body
                      .split("\n\n")
                      .map((p: string, j: number) => (
                        <p
                          key={j}
                          className="text-primary/70 leading-relaxed mb-4 last:mb-0"
                        >
                          {p}
                        </p>
                      ))
                )}
              </div>
            </section>
          );
        }
      )}

      {/* ──────────── Registration Form ──────────── */}
      <section
        id="register"
        className="bg-gray-light py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-xl mx-auto">
          {ctaSection?.headline && (
            <h2 className="text-3xl font-bold mb-3 text-center">
              {ctaSection.headline}
            </h2>
          )}
          {ctaSection?.body && (
            <p className="text-primary/60 text-center mb-8">
              {ctaSection.body}
            </p>
          )}
          <ConventionForm />
        </div>
      </section>
    </div>
  );
}
