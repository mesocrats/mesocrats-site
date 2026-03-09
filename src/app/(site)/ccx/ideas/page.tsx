import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { formPageContentQuery } from "@/sanity/lib/queries";
import IdeaForm from "./IdeaForm";

export async function generateMetadata(): Promise<Metadata> {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "submit-ideas" },
    { next: { revalidate: 60 } }
  );
  return {
    title: content?.heroHeadline || undefined,
    description: content?.heroSubheadline || undefined,
  };
}

export default async function SubmitIdeaPage() {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "submit-ideas" },
    { next: { revalidate: 60 } }
  );

  return (
    <div>
      {/* Hero */}
      <section className="bg-accent text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
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
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      {/* ──────────── How It Works — Timeline ──────────── */}
      <section className="bg-primary text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-accent-light uppercase mb-4 text-center">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">
            From Idea to Convention Floor
          </h2>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-accent/40 hidden sm:block" />

            {/* Step 1 */}
            <div className="relative flex gap-6 sm:gap-8 mb-14">
              <div className="relative z-10 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shrink-0 ring-4 ring-primary">
                1
              </div>
              <div className="pt-1">
                <p className="text-xs font-bold tracking-widest text-accent-light uppercase mb-2">
                  Submit Your Idea
                </p>
                <p className="text-white/80 leading-relaxed">
                  Tell us what policy position, platform plank, or foundational
                  tenet you think the Mesocratic Party should consider. Be specific.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-6 sm:gap-8 mb-14">
              <div className="relative z-10 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shrink-0 ring-4 ring-primary">
                2
              </div>
              <div className="pt-1">
                <p className="text-xs font-bold tracking-widest text-accent-light uppercase mb-2">
                  The Community Weighs In
                </p>
                <p className="text-white/80 leading-relaxed">
                  Other Mesocrats can upvote and comment on submissions. The best
                  ideas rise to the top. Common themes are aggregated using AI
                  tools, so that nearly every voice is truly heard.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex gap-6 sm:gap-8">
              <div className="relative z-10 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shrink-0 ring-4 ring-primary">
                3
              </div>
              <div className="pt-1">
                <p className="text-xs font-bold tracking-widest text-accent-light uppercase mb-2">
                  Top Ideas Go to CCX
                </p>
                <p className="text-white/80 leading-relaxed">
                  The highest-rated submissions will be formally introduced at the
                  convention for debate and potential ratification.
                </p>
              </div>
            </div>
          </div>

          {/* Closing callout */}
          <p className="text-xl sm:text-2xl font-bold text-white text-center mt-16">
            This isn&apos;t a suggestion box. It&apos;s a pipeline to the convention floor.
          </p>
        </div>
      </section>

      {/* Idea Submission Form */}
      <section className="bg-gray-light py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <IdeaForm />
        </div>
      </section>
    </div>
  );
}
