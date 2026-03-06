"use client";

import SectionHeader from "../../components/SectionHeader";
import Badge from "../../components/Badge";
import CodeBlock from "../../components/CodeBlock";

/* ------------------------------------------------------------------ */
/*  Code examples                                                      */
/* ------------------------------------------------------------------ */

const installCode = `npm install @mesocrats/mce-sdk`;

const quickStartCode = `import { MesocraticClient } from '@mesocrats/mce-sdk';

const client = new MesocraticClient({
  TOKEN: 'mce_live_your_api_key',
});

// Get your committee
const { data: committee } = await client.committees.getCommittee();

// Record a contribution
const { data: contribution } = await client.contributions.createContribution({
  contributor_id: 'uuid',
  amount_cents: 25000,
  date_received: '2026-03-06',
  contribution_type: 'individual',
});`;

/* ------------------------------------------------------------------ */
/*  Services data                                                      */
/* ------------------------------------------------------------------ */

const services = [
  {
    name: "CommitteesService",
    accessor: "client.committees",
    description: "Manage your committee record. Create or retrieve the committee bound to your API key.",
    methods: [
      "getCommittee(): Promise<{ data: Committee | null }>",
      "createCommittee(body): Promise<{ data: Committee }>",
    ],
  },
  {
    name: "ContributorsService",
    accessor: "client.contributors",
    description: "Create and search contributor (donor) records with automatic match_key generation.",
    methods: [
      "listContributors(page?, limit?, search?): Promise<{ data: Contributor[], pagination }>",
      "createContributor(body): Promise<{ data: Contributor }>",
    ],
  },
  {
    name: "ContributionsService",
    accessor: "client.contributions",
    description: "Record contributions with automatic FEC limit enforcement, YTD aggregate tracking, and itemization.",
    methods: [
      "listContributions(page?, limit?, startDate?, endDate?, contributorId?, itemized?): Promise<{ data: Contribution[], pagination }>",
      "createContribution(body): Promise<{ data: Contribution & { aggregate: AggregateInfo } }>",
      "getContribution(id): Promise<{ data: Contribution }>",
    ],
  },
  {
    name: "DisbursementsService",
    accessor: "client.disbursements",
    description: "Track committee expenditures with FEC-compliant categorization.",
    methods: [
      "listDisbursements(page?, limit?, startDate?, endDate?, category?): Promise<{ data: Disbursement[], pagination }>",
      "createDisbursement(body): Promise<{ data: Disbursement }>",
    ],
  },
  {
    name: "ReportsService",
    accessor: "client.reports",
    description: "Create and manage FEC filing reports with coverage period tracking.",
    methods: [
      "listReports(status?, reportType?): Promise<{ data: Report[] }>",
      "createReport(body): Promise<{ data: Report }>",
    ],
  },
  {
    name: "ComplianceService",
    accessor: "client.compliance",
    description: "Look up FEC contribution limits for your committee type and election cycle.",
    methods: [
      "getComplianceLimits(): Promise<{ data: { committee_type, cycle, limits, itemization_threshold } }>",
    ],
  },
  {
    name: "SystemService",
    accessor: "client.system",
    description: "Health check endpoint. No authentication required.",
    methods: [
      "getHealth(): Promise<{ status, version, timestamp, database }>",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Models data                                                        */
/* ------------------------------------------------------------------ */

const models = [
  { name: "Committee", description: "Committee record with FEC ID, type, treasurer, and filing frequency" },
  { name: "Contribution", description: "Individual contribution with amount, date, itemization, and attestation flags" },
  { name: "Contributor", description: "Donor record with name, address, employer, occupation, and match_key" },
  { name: "Disbursement", description: "Expenditure record with payee, purpose, category, and optional receipt" },
  { name: "Report", description: "FEC filing report with coverage period, status, and filing deadline" },
  { name: "AggregateInfo", description: "Year-to-date contribution aggregate for a contributor" },
  { name: "Limit", description: "FEC contribution limits by committee type for the current cycle" },
  { name: "Page", description: "Paginated response page wrapper" },
  { name: "Pagination", description: "Pagination metadata: page, limit, total, total_pages" },
  { name: "Error", description: "API error response with error message string" },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SDKsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Hero */}
      <SectionHeader
        eyebrow="Client Library"
        title="TypeScript SDK"
        subtitle="The official SDK for the Mesocratic Compliance Engine. Fully typed. Generated from our OpenAPI spec."
      />

      {/* Package info card */}
      <div className="rounded-xl border border-white/[0.06] bg-[#12121F] p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-white font-dev-mono">
            @mesocrats/mce-sdk
          </h2>
          <Badge text="v1.0.0" variant="green" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Package</p>
            <p className="text-gray-300 font-dev-mono text-xs">@mesocrats/mce-sdk</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">License</p>
            <p className="text-gray-300">MIT</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">TypeScript</p>
            <p className="text-gray-300">Full types included</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Node.js</p>
            <p className="text-gray-300">&gt;= 18.0.0</p>
          </div>
        </div>
      </div>

      {/* Installation */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4">Installation</h3>
        <CodeBlock code={installCode} language="bash" title="npm" />
      </div>

      {/* Quick Start */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-4">Quick Start</h3>
        <CodeBlock
          code={quickStartCode}
          language="typescript"
          title="Initialize the client"
          showLineNumbers
        />
      </div>

      {/* Services */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-6">Services</h3>
        <div className="space-y-4">
          {services.map((svc) => (
            <div
              key={svc.name}
              className="rounded-xl border border-white/[0.06] bg-[#12121F] p-5"
            >
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-sm font-bold text-white font-dev-mono">
                  {svc.name}
                </h4>
                <span className="text-xs text-gray-500 font-dev-mono">
                  {svc.accessor}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{svc.description}</p>
              <div className="space-y-1">
                {svc.methods.map((m, i) => (
                  <p key={i} className="text-xs text-gray-500 font-dev-mono leading-relaxed">
                    {m}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-6">Typed Models</h3>
        <div className="rounded-xl border border-white/[0.06] bg-[#12121F] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Model</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m, i) => (
                <tr
                  key={m.name}
                  className={i < models.length - 1 ? "border-b border-white/[0.04]" : ""}
                >
                  <td className="px-5 py-3 text-[#4374BA] font-dev-mono text-xs font-medium">
                    {m.name}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OpenAPI spec */}
      <div className="rounded-xl border border-white/[0.06] bg-[#12121F] p-6 mb-10">
        <h3 className="text-lg font-bold text-white mb-2">
          OpenAPI Specification
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          Machine-readable API description conforming to OpenAPI 3.1. Use it to
          generate client libraries, mock servers, or import into Postman,
          Insomnia, or any OpenAPI-compatible tool.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api-reference"
            className="inline-flex items-center px-4 py-2.5 rounded-lg border border-white/[0.08] text-sm font-medium text-gray-300 hover:bg-white/[0.04] hover:text-white transition-colors"
          >
            View Spec
          </a>
          <a
            href="/openapi.json"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#4374BA] text-sm font-medium text-white hover:bg-[#4374BA]/90 transition-colors"
          >
            Download JSON
          </a>
        </div>
      </div>

      {/* Coming Soon — Other SDKs */}
      <div>
        <h3 className="text-lg font-bold text-white mb-6">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Python */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-base font-bold text-gray-400">Python SDK</h4>
              <Badge text="Coming Soon" variant="purple" />
            </div>
            <p className="text-sm text-gray-500 font-dev-mono mb-2">
              pip install mesocrats-mce
            </p>
            <p className="text-sm text-gray-500">
              Full Python client with type hints and async support. Targeting Q3 2026.
            </p>
          </div>

          {/* Ruby */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-base font-bold text-gray-400">Ruby SDK</h4>
              <Badge text="Coming Soon" variant="purple" />
            </div>
            <p className="text-sm text-gray-500 font-dev-mono mb-2">
              gem install mesocrats-mce
            </p>
            <p className="text-sm text-gray-500">
              Ruby gem with idiomatic API wrappers. Targeting Q4 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
