import type { Metadata } from "next";
import Image from "next/image";
import PortableTextRenderer from "@/components/PortableTextRenderer";
import { client } from "@/sanity/lib/client";
import { formPageContentQuery } from "@/sanity/lib/queries";
import VolunteerForm from "./VolunteerForm";

export async function generateMetadata(): Promise<Metadata> {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "volunteer" },
    { next: { revalidate: 60 } }
  );
  return {
    title: content?.heroHeadline || undefined,
    description: content?.heroSubheadline || undefined,
  };
}

export default async function VolunteerPage() {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "volunteer" },
    { next: { revalidate: 60 } }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cmsCards = content?.cards as any[] | undefined;
  const tracks =
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

      {/* Volunteer Tracks */}
      {tracks.length > 0 && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tracks.map((track) => (
                <div
                  key={track.title}
                  className="bg-gray-light rounded-lg p-8"
                >
                  {track.title && (
                    <h3 className="text-xl font-bold mb-3">{track.title}</h3>
                  )}
                  {track.description && (
                    <p className="text-sm text-primary/70 leading-relaxed">
                      {track.description}
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
          <VolunteerForm tracks={tracks.map((t) => t.title)} />
        </div>
      </section>
    </div>
  );
}
