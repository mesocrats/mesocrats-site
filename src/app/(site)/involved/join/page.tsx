import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import { client } from "@/sanity/lib/client";
import { formPageContentQuery } from "@/sanity/lib/queries";
import JoinForm from "./JoinForm";

export async function generateMetadata(): Promise<Metadata> {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "join" },
    { next: { revalidate: 60 } }
  );
  return {
    title: content?.heroHeadline || undefined,
    description: content?.heroSubheadline || undefined,
  };
}

export default async function JoinPage() {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "join" },
    { next: { revalidate: 60 } }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmsCards = content?.cards as any[] | undefined;
  const cards =
    cmsCards && cmsCards.length > 0
      ? cmsCards.map((c: { headline?: string; body?: string }) => ({
          title: c.headline || "",
          description: c.body || "",
        }))
      : [];

  const hasBodyContent = content?.bodyContent && content.bodyContent.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-accent text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {content?.heroImage && (
          <>
            <Image
              src={content.heroImage}
              alt=""
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}
        <div className="relative max-w-3xl mx-auto text-center">
          {content?.heroHeadline && (
            <h1 className="text-5xl sm:text-7xl font-bold mb-4">
              {content.heroHeadline}
            </h1>
          )}
          {content?.heroSubheadline && (
            <p className="text-lg font-semibold text-white/90 max-w-xl mx-auto">
              {content.heroSubheadline}
            </p>
          )}
        </div>
        {content?.imageCredit && (
          <span className="absolute bottom-2 right-3 text-[9px] text-white/50">
            {content.imageCredit}
          </span>
        )}
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      {/* Why Join */}
      {cards.length > 0 && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((item) => (
                <div key={item.title} className="bg-gray-light rounded-lg p-8">
                  {item.title && (
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  )}
                  {item.description && (
                    <p className="text-sm text-primary/70 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CMS Body Content (if present) */}
      {hasBodyContent && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto border-l-4 border-[#4374BA] border-r-4 border-r-[#EE2C24] bg-gray-100 rounded-lg p-8 sm:p-10 text-center">
            <PortableTextRenderer value={content.bodyContent} className="text-lg leading-relaxed" />
          </div>
        </section>
      )}

      {/* Signup Form */}
      <section className="bg-gray-light py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <JoinForm />
        </div>
      </section>

      {/* Spread the Word */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/involved/volunteer"
              className="bg-accent hover:bg-accent-light text-white font-bold px-8 py-3 rounded transition-colors"
            >
              Volunteer
            </Link>
            <Link
              href="/platform"
              className="border-2 border-accent text-accent font-bold px-8 py-3 rounded hover:bg-accent hover:text-white transition-colors"
            >
              Read the Platform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
