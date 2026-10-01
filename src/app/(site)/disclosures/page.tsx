import type { Metadata } from "next";
import { DONATIONS_PAUSED } from "@/lib/donations";

export const metadata: Metadata = { title: "FEC Disclosures" };

export default function DisclosuresPage() {
  return (
    <div>
      <section className="bg-primary text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold">FEC Disclosures</h1>
          <p className="text-sm text-white/50 mt-2">
            Federal Election Commission compliance and contribution rules.
          </p>
        </div>
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 prose-sm space-y-8 text-primary/70 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-primary mb-3">
            Paid-For Disclaimer
          </h2>
          <div className="bg-gray-light rounded-lg p-6">
            <p className="text-primary/80 font-medium">
              Paid for by the Mesocratic National Committee (mesocrats.org). Not
              authorized by any candidate or candidate&apos;s committee.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">
            Organization Information
          </h2>
          <div className="bg-gray-light rounded-lg p-6 space-y-2 text-sm">
            <p>
              <strong className="text-primary">Organization Name:</strong>{" "}
              Mesocratic National Committee
            </p>
            <p>
              <strong className="text-primary">Organization Type:</strong>{" "}
              Section 527 Political Organization
            </p>
            <p>
              <strong className="text-primary">EIN:</strong> 39-3411870
            </p>
            <p>
              <strong className="text-primary">State of Formation:</strong>{" "}
              Virginia
            </p>
            <p>
              <strong className="text-primary">Mailing Address:</strong> P.O.
              Box 15523, Richmond, VA 23227
            </p>
            <p>
              <strong className="text-primary">Website:</strong> mesocrats.org
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">
            Contribution Rules
          </h2>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              Contributions or gifts to the Mesocratic National Committee are
              <strong> not tax deductible</strong> as charitable contributions
              for federal income tax purposes.
            </li>
            <li>
              Federal law requires political organizations to use their best
              efforts to collect and report the <strong>name, mailing address,
              occupation, and name of employer</strong> of individuals whose
              contributions exceed $200 in an election cycle.
            </li>
            <li>
              Contributions from foreign nationals (individuals who are not U.S.
              citizens or lawful permanent residents) are prohibited by federal
              law.
            </li>
            <li>
              Corporate contributions are subject to applicable federal and state
              laws and regulations.
            </li>
            <li>
              Contributions are subject to the limits and prohibitions of the
              Federal Election Campaign Act.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">
            Reporting and Transparency
          </h2>
          <p className="mb-3">
            As a Section 527 political organization, the Mesocratic National
            Committee files required reports with the Internal Revenue Service
            (IRS) and complies with all applicable federal and state disclosure
            requirements.
          </p>
          {DONATIONS_PAUSED ? (
            <p>
              The Mesocratic National Committee is not yet accepting
              contributions. We are completing the committee&apos;s
              incorporation and opening its bank accounts. Once that work is
              finished, all contributions will be subject to the rules above and
              reported as required by law.
            </p>
          ) : (
            <p>
              We are committed to transparency in our fundraising, spending, and
              governance. Contributions to the Mesocratic National Committee can
              be made at{" "}
              <a
                href="/donate"
                className="text-secondary hover:underline"
              >
                mesocrats.org/donate
              </a>
              . All contributions are processed via Stripe and reported to the
              FEC in accordance with federal election law.
            </p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Contact</h2>
          <p>
            For questions about contributions, compliance, or disclosure
            requirements, contact us at{" "}
            <a
              href="mailto:info@mesocrats.org"
              className="text-secondary hover:underline"
            >
              info@mesocrats.org
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
