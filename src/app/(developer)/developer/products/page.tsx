import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";

/* ------------------------------------------------------------------ */
/*  Compliance API feature grid                                        */
/* ------------------------------------------------------------------ */

interface ComplianceFeature {
  name: string;
  live: boolean;
}

const complianceFeatures: ComplianceFeature[] = [
  { name: "Contribution tracking", live: true },
  { name: "Real-time limit enforcement", live: true },
  { name: "Aggregate YTD tracking", live: true },
  { name: "Itemization threshold detection", live: true },
  { name: "Disbursement tracking", live: true },
  { name: "Contributor management", live: true },
  { name: "Report creation (drafts)", live: true },
  { name: "FEC compliance limits reference", live: true },
  { name: "Immutable audit log", live: true },
  { name: ".fec file export", live: false },
  { name: "Webhook delivery", live: false },
  { name: "QuickBooks integration", live: false },
];

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 mt-0.5"
    >
      <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#6B7280"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 mt-0.5"
    >
      <circle cx="8" cy="8" r="6.5" />
      <polyline points="8 4.5 8 8 10.5 9.5" />
    </svg>
  );
}

function ComplianceAPICard() {
  return (
    <div className="rounded-xl border border-white/[0.06] border-l-4 border-l-[#4374BA] bg-[#12121F] p-6 md:p-8 mb-12">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <Badge text="LIVE" variant="green" size="md" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-1">Compliance API</h2>
      <p className="text-gray-400 mb-6">
        The Mesocratic Compliance Engine (MCE)
      </p>

      <a
        href="/api-reference"
        className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#4374BA] text-sm font-medium text-white hover:bg-[#4374BA]/90 transition-colors mb-8"
      >
        View API Reference
      </a>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 mb-8">
        {complianceFeatures.map((feature) => (
          <div key={feature.name} className="flex items-start gap-2.5">
            {feature.live ? <CheckIcon /> : <ClockIcon />}
            <span
              className={`text-sm ${feature.live ? "text-gray-300" : "text-gray-500"}`}
            >
              {feature.name}
              {!feature.live && (
                <span className="ml-1.5 text-[10px] text-gray-600 uppercase tracking-wider">
                  Soon
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-6 border-t border-white/[0.06]">
        {[
          "~1,700 lines TypeScript",
          "Production since Feb 2026",
          "Donation system built on custom Stripe + MCE integration. Live processing currently paused.",
          "MIT License",
        ].map((tag) => (
          <span
            key={tag}
            className="text-xs text-gray-500 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Coming soon products                                               */
/* ------------------------------------------------------------------ */

const upcomingProducts = [
  {
    title: "Party Formation API",
    timeline: "Coming Q3 2026",
    badgeVariant: "purple" as const,
    borderColor: "border-l-[#6C3393]",
    description:
      "State-by-state party registration requirements, petition tracking, signature validation, and filing deadline monitoring. Covers all 50 states, DC, and territories -- from articles of incorporation through ballot access certification. Includes entity type recommendations, registered agent requirements, and ongoing compliance calendars for each jurisdiction.",
  },
  {
    title: "Ballot Access API",
    timeline: "Coming Q4 2026",
    badgeVariant: "red" as const,
    borderColor: "border-l-[#EE2C24]",
    description:
      "Candidate filing requirements by state and office level, petition signature thresholds, filing fee schedules, and deadline calendars. Supports federal, state, and local races. Includes document template generation for nomination papers, petition sheets, and financial disclosure forms required by each state election commission.",
  },
  {
    title: "Election Calendar API",
    timeline: "Coming 2027",
    badgeVariant: "cyan" as const,
    borderColor: "border-l-cyan-500",
    description:
      "Comprehensive election dates, voter registration deadlines, early voting windows, and filing periods across all 50 states, DC, and territories. Real-time updates when deadlines shift. Includes primary and general election dates, runoff schedules, special election triggers, and recall procedures. Webhook notifications for deadline changes.",
  },
];

function UpcomingProducts() {
  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-6">Coming Soon</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {upcomingProducts.map((product) => (
          <Card key={product.title} className={`border-l-4 ${product.borderColor}`}>
            <div className="mb-3">
              <Badge text={product.timeline} variant={product.badgeVariant} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {product.title}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {product.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProductsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <SectionHeader
        eyebrow="API Products"
        title="The marketplace for political technology"
        subtitle="Standalone APIs that handle the hardest parts of political compliance, party formation, and ballot access -- so you can focus on building."
      />

      <ComplianceAPICard />
      <UpcomingProducts />
    </div>
  );
}
