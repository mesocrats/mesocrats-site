import Link from "next/link";

export default function LivingPlatform() {
  return (
    <section className="bg-gray-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg p-8 sm:p-10 border border-primary/10">
          <h3 className="text-lg font-bold uppercase tracking-wide mb-4">
            This Is a Living Platform
          </h3>
          <p className="text-sm text-primary/70 leading-relaxed mb-4">
            The position on this page is a starting point &mdash; not the final
            word. The Mesocratic Party&apos;s platform is written, debated, and
            ratified by its members at Constitutional Convention X, held annually
            in New Orleans every May. Between conventions, members shape the
            agenda through year-round digital engagement. These positions will
            evolve as the party grows. That&apos;s not a weakness. It&apos;s the
            whole point.
          </p>
          <p className="text-sm font-semibold mb-3">
            Want a voice in where this policy goes next?
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/involved/join"
                className="text-secondary hover:underline font-medium"
              >
                Join the Party
              </Link>{" "}
              <span className="text-primary/50">
                &mdash; become a member and vote for your CCX State
                Representatives
              </span>
            </li>
            <li>
              <Link
                href="/ccx"
                className="text-secondary hover:underline font-medium"
              >
                Submit an Idea
              </Link>{" "}
              <span className="text-primary/50">
                &mdash; propose a change or addition to this position
              </span>
            </li>
            <li>
              <Link
                href="/ccx"
                className="text-secondary hover:underline font-medium"
              >
                Learn about CCX
              </Link>{" "}
              <span className="text-primary/50">
                &mdash; see how 5,000 elected State Reps shape the platform
                every year
              </span>
            </li>
            <li>
              <Link
                href="/platform/how-it-works"
                className="text-secondary hover:underline font-medium"
              >
                How Our Platform Works
              </Link>{" "}
              <span className="text-primary/50">
                &mdash; learn how our platform is governed
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
