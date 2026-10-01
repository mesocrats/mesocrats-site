import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";

/* ------------------------------------------------------------------ */
/*  Top cards                                                          */
/* ------------------------------------------------------------------ */

function GitHubIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-white"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function TopCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <Card>
        <div className="mb-4">
          <GitHubIcon />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          GitHub Repository
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          Source code for the Mesocratic Compliance Engine, developer portal,
          and client SDKs. All MIT licensed.
        </p>
        <p className="text-xs font-dev-mono text-gray-500 mb-4">
          github.com/mesocrats/mesocrats-site
        </p>
        <a
          href="https://github.com/mesocrats/mesocrats-site"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#4374BA] hover:text-[#6B9FE8] transition-colors"
        >
          View on GitHub
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5.25 3.5L8.75 7L5.25 10.5" />
          </svg>
        </a>
      </Card>

      <Card>
        <div className="mb-4">
          <ChatIcon />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          GitHub Discussions
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          Ask questions, share ideas, report bugs, and connect with other
          developers building on the MCE platform.
        </p>
        <a
          href="https://github.com/mesocrats/mesocrats-site/discussions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#4374BA] hover:text-[#6B9FE8] transition-colors"
        >
          Join Discussions
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5.25 3.5L8.75 7L5.25 10.5" />
          </svg>
        </a>
      </Card>

      <Card>
        <div className="mb-4">
          <DocIcon />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          Contributing Guide
        </h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          How to file issues, submit pull requests, propose RFCs, and sign the
          Contributor License Agreement.
        </p>
        <a
          href="https://github.com/mesocrats/mesocrats-site/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-[#4374BA] hover:text-[#6B9FE8] transition-colors"
        >
          Read Guide
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M5.25 3.5L8.75 7L5.25 10.5" />
          </svg>
        </a>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Changelog                                                          */
/* ------------------------------------------------------------------ */

interface Release {
  version: string;
  date: string;
  badge: string;
  badgeVariant: "green" | "gray";
  changes: string[];
}

const releases: Release[] = [
  {
    version: "v1.0.1",
    date: "October 1, 2026",
    badge: "Notice",
    badgeVariant: "gray",
    changes: [
      "Donations paused pending committee incorporation and new banking setup.",
    ],
  },
  {
    version: "v1.0.0",
    date: "February 28, 2026",
    badge: "Current",
    badgeVariant: "green",
    changes: [
      "FEC Form 3X report generator with Schedule A and Schedule B",
      "IRS Form 8872 XML generator (XSD 2.3 conformant)",
      ".fec pipe-delimited file export (v8.4+ spec)",
      "Disbursement tracking API with Stripe fee auto-capture",
      "Best-efforts follow-up email system via SendGrid",
      "Contributor matching algorithm (normalized name + ZIP)",
      "Immutable audit log for every data mutation",
      "MCE API endpoints: GET /api/mce/reports, POST/GET /api/mce/disbursements",
      "ISPolitical integration completely removed and replaced",
    ],
  },
  {
    version: "v0.1.0",
    date: "February 25, 2026",
    badge: "Initial",
    badgeVariant: "gray",
    changes: [
      "Donation system live at mesocrats.org/donate",
      "Stripe payment processing with 7-step validation",
      "Supabase schema: donors, donations, donation_annual_totals",
      "FEC contribution limit enforcement ($44,300 individual-to-national-party)",
      "Five FEC-required attestation checkboxes",
      "SendGrid donation receipt emails with FEC disclosure",
    ],
  },
];

function Changelog() {
  return (
    <div className="mb-16">
      <h3 className="text-2xl font-bold text-white mb-8">Changelog</h3>
      <div className="max-w-3xl space-y-6">
        {releases.map((release) => (
          <Card key={release.version} className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-dev-mono text-white">
                    {release.version}
                  </span>
                  <Badge
                    text={release.badge}
                    variant={release.badgeVariant}
                  />
                </div>
                <span className="text-sm text-gray-500">{release.date}</span>
              </div>
              <ul className="space-y-2">
                {release.changes.map((change, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-300 leading-relaxed"
                  >
                    <span className="text-gray-500 mr-2">-</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MIT License callout                                                */
/* ------------------------------------------------------------------ */

function LicenseCallout() {
  return (
    <div className="rounded-xl border border-white/[0.06] border-t-2 border-t-emerald-500 bg-[#12121F] p-8 text-center max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-white mb-4">MIT License</h3>
      <p className="text-sm text-gray-300 leading-relaxed">
        Permission is hereby granted, free of charge, to any person obtaining a
        copy of this software. Use it, fork it, sell it, build on it. No
        restrictions. No vendor lock-in. No political alignment required.
      </p>
      <p className="mt-4 text-xs text-gray-500">
        Copyright 2026 Mesocratic National Committee
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <SectionHeader
        eyebrow="Open Source"
        title="Built in the open. For everyone."
        subtitle="The MCE platform is MIT licensed. Every line of code is public. Contributions, issues, and ideas are welcome from developers of every political persuasion."
      />

      <TopCards />
      <Changelog />
      <LicenseCallout />
    </div>
  );
}
