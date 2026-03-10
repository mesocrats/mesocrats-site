import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { formPageContentQuery } from "@/sanity/lib/queries";
import ConventionForm from "../ConventionForm";

export async function generateMetadata(): Promise<Metadata> {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "ccx-register" },
    { next: { revalidate: 60 } }
  );
  return {
    title: content?.heroHeadline || undefined,
    description: content?.heroSubheadline || undefined,
  };
}

export default async function ConventionRegisterPage() {
  const content = await client.fetch(
    formPageContentQuery,
    { formType: "ccx-register" },
    { next: { revalidate: 60 } }
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-primary text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
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

      {/* ──────────── Ways to Participate ──────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-accent uppercase mb-4 text-center">
            Get Involved
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-14 text-center">
            Ways to Participate
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-gray-light rounded-lg p-8 sm:p-10 flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3">Run as a CCX State Rep</h3>
              <p className="text-sm text-primary/70 leading-relaxed flex-1">
                Register as a Mesocrat, then declare your candidacy for State Rep
                in your state. If your fellow Mesocrats choose you, you&apos;ll
                join 99 others from your state at CCX with a full voice and vote.
              </p>
              <Link
                href="/candidates/run"
                className="inline-block mt-6 text-sm font-semibold text-secondary hover:underline"
              >
                Run for Office &rarr;
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-light rounded-lg p-8 sm:p-10 flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3">Vote for Your State Reps</h3>
              <p className="text-sm text-primary/70 leading-relaxed flex-1">
                Every registered Mesocrat can vote in their state&apos;s CCX State
                Rep election each November on the digital voting platform.
                You&apos;re choosing who represents you at the convention.
              </p>
              <Link
                href="/involved/join"
                className="inline-block mt-6 text-sm font-semibold text-secondary hover:underline"
              >
                Join to Vote &rarr;
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-light rounded-lg p-8 sm:p-10 flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3">Volunteer at the Event</h3>
              <p className="text-sm text-primary/70 leading-relaxed flex-1">
                Want to be part of CCX without running for State Rep? Volunteer at
                the event. Help run sessions, support delegates, and be on the
                ground in New Orleans when history gets made.
              </p>
              <Link
                href="/involved/volunteer"
                className="inline-block mt-6 text-sm font-semibold text-secondary hover:underline"
              >
                Volunteer Now &rarr;
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-gray-light rounded-lg p-8 sm:p-10 flex flex-col hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3">Watch the Live Stream</h3>
              <p className="text-sm text-primary/70 leading-relaxed flex-1">
                Every session of CCX will be live-streamed. Watch tenets get
                drafted in real time. If you can&apos;t be in the room, you can
                still be part of the moment.
              </p>
              <Link
                href="#register"
                className="inline-block mt-6 text-sm font-semibold text-secondary hover:underline"
              >
                Register for Updates &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── The CCX Process — Timeline ──────────── */}
      <section className="bg-primary text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-widest text-accent-light uppercase mb-4 text-center">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-center">
            The CCX Process
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
                  Join
                </p>
                <p className="text-white/80 leading-relaxed">
                  Become a registered Mesocrat. It&apos;s free and takes 30 seconds.
                </p>
                <Link
                  href="/involved/join"
                  className="inline-block mt-3 text-sm font-semibold text-secondary hover:text-secondary-light underline underline-offset-2"
                >
                  Join the Party &rarr;
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-6 sm:gap-8 mb-14">
              <div className="relative z-10 w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shrink-0 ring-4 ring-primary">
                2
              </div>
              <div className="pt-1">
                <p className="text-xs font-bold tracking-widest text-accent-light uppercase mb-2">
                  Run or Vote &mdash; November
                </p>
                <p className="text-white/80 leading-relaxed">
                  Every November, each state elects 100 CCX State Representatives
                  through the Mesocratic digital voting platform. You can run as a
                  candidate or vote for who represents your state.
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
                  Convention &mdash; May, New Orleans
                </p>
                <p className="text-white/80 leading-relaxed">
                  5,000 elected State Reps from all 50 states convene in New
                  Orleans to draft tenets, debate the platform, and elect party
                  leadership.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── What Happens at CCX ──────────── */}
      <section className="bg-accent text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-14 text-center">
            What Happens at CCX
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-lg p-8 sm:p-10">
              <h3 className="text-xl font-bold mb-3">Draft &amp; Ratify the Tenets</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                The foundational tenets define who we are &mdash; our
                Constitution. At the first CCX in May 2027, they&apos;ll be
                drafted and ratified. In future years, tenets may be amended by
                delegate vote.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-8 sm:p-10">
              <h3 className="text-xl font-bold mb-3">Debate the Platform</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Our published platform has positions on 15+ issues. At CCX, those
                positions are debated, refined, and officially ratified. Every
                year, new issues are introduced and existing positions are
                challenged.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-8 sm:p-10">
              <h3 className="text-xl font-bold mb-3">Elect Leadership</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                Chair, Vice Chair, Treasurer, Secretary, et al &mdash; the people who run
                the MNC and represent the party nationally. Your delegates decide
                who leads. Every four years at CCX.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── Term Limits Callout ──────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="border-l-4 border-accent bg-gray-light rounded-r-lg p-8 sm:p-10">
            <p className="text-xs font-bold tracking-widest text-accent uppercase mb-3">
              Important Rule
            </p>
            <p className="text-primary/80 leading-relaxed font-medium">
              Term limits: No CCX State Rep may attend more than once every four
              years, and no consecutive terms. New voices, every cycle. This
              isn&apos;t a party where the same insiders show up every year. CCX
              belongs to the members.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="bg-gray-light py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <ConventionForm />
        </div>
      </section>
    </div>
  );
}
