import Badge from "../components/Badge";
import Card from "../components/Card";
import CodeBlock from "../components/CodeBlock";
import SectionHeader from "../components/SectionHeader";

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */

function HeroSection() {
  const installCode = `npm install @mesocrats/mce-sdk`;

  const previewCode = `import { MCE } from "@mesocrats/mce-sdk";

const mce = new MCE({ apiKey: "mce_live_..." });

// Generate an FEC-compliant Form 3X report
const report = await mce.compliance.generateReport({
  committeeId: "C00123456",
  reportType: "Q1",
  year: 2026,
});

console.log(report.filing_id); // -> "FEC-2026-Q1-..."`;

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4374BA]/5 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="min-w-0">
            <div className="mb-6">
              <Badge text="Open Source -- MIT License" variant="green" size="md" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              The open platform for{" "}
              <span className="bg-gradient-to-r from-[#4374BA] via-[#6C3393] to-[#EE2C24] bg-clip-text text-transparent">
                American political technology
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-lg">
              APIs and prompt libraries that remove the friction from political
              compliance, party formation, and ballot access -- so you can focus
              on building for democracy.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/api-reference"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white bg-transparent font-medium text-sm transition-colors hover:bg-[#4374BA] hover:border-[#4374BA]"
              >
                Read the Docs
              </a>
              <a
                href="/prompt-library"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white bg-transparent font-medium text-sm transition-colors hover:bg-[#EE2C24] hover:border-[#EE2C24]"
              >
                Try the Prompt Library
              </a>
            </div>
          </div>

          {/* Right: Code preview */}
          <div className="min-w-0 w-full max-w-full overflow-hidden space-y-4">
            <CodeBlock code={installCode} language="bash" title="Terminal" />
            <CodeBlock
              code={previewCode}
              language="typescript"
              title="index.ts"
              showLineNumbers
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  TWO PATHS                                                          */
/* ------------------------------------------------------------------ */

function TwoPathsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Two ways to build"
          title="Built for developers. Designed for everyone."
          subtitle="Whether you write code or write prompts, the MCE platform meets you where you are."
        />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Developer Path */}
          <Card glowColor="#4374BA">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#4374BA]/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4374BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Developer Path</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Full programmatic access to every MCE capability through REST APIs
              and typed SDKs.
            </p>
            <ul className="space-y-2.5">
              {[
                "RESTful API with OpenAPI 3.1 spec",
                "TypeScript and Python SDKs",
                "OAuth 2.0 authentication",
                "Webhook event subscriptions",
                "Interactive API sandbox",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="text-[#4374BA] mt-0.5 shrink-0">-&gt;</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          {/* Prompt Path */}
          <Card glowColor="#6C3393">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#6C3393]/15 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C3393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Prompt Path</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Copy-paste prompt templates that work with Claude, ChatGPT, and
              any major LLM -- no code required.
            </p>
            <ul className="space-y-2.5">
              {[
                "Copy-paste prompt templates",
                "Claude.ai and ChatGPT ready",
                "No code or API key required",
                "Step-by-step compliance guides",
                "Community-contributed library",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <span className="text-[#6C3393] mt-0.5 shrink-0">-&gt;</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PRODUCT CATALOG                                                    */
/* ------------------------------------------------------------------ */

const products = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4374BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    status: "GA",
    statusVariant: "blue" as const,
    title: "Compliance API",
    description:
      "FEC Form 3X generation, contribution limits, donor matching, receipt validation, and IRS Form 8872 XML -- everything a multi-candidate committee needs to stay compliant.",
    color: "#4374BA",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C3393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    status: "Coming Q3",
    statusVariant: "purple" as const,
    title: "Party Formation API",
    description:
      "State-by-state party registration requirements, petition tracking, signature validation, and filing deadlines for new political party formation.",
    color: "#6C3393",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EE2C24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    status: "Coming Q4",
    statusVariant: "red" as const,
    title: "Ballot Access API",
    description:
      "Candidate filing requirements by state and office, petition thresholds, filing fees, deadline calendars, and document template generation.",
    color: "#EE2C24",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    status: "Coming 2027",
    statusVariant: "cyan" as const,
    title: "Election Calendar API",
    description:
      "Comprehensive election dates, registration deadlines, early voting windows, and filing periods across all 50 states, DC, and territories.",
    color: "#06B6D4",
  },
];

function ProductCatalogSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0D0D18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Products"
          title="APIs for every layer of political infrastructure"
          subtitle="From compliance to ballot access, the MCE platform covers the full stack of American political technology."
        />

        <div className="grid sm:grid-cols-2 gap-6">
          {products.map((product) => (
            <Card key={product.title}>
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${product.color}15` }}
                >
                  {product.icon}
                </div>
                <Badge text={product.status} variant={product.statusVariant} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {product.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  QUICK START                                                        */
/* ------------------------------------------------------------------ */

const quickStartSteps = [
  {
    step: 1,
    title: "Get your API key",
    description: "Sign up and generate an API key from the developer dashboard.",
    code: `export MCE_API_KEY="mce_live_your_key_here"`,
    language: "bash",
  },
  {
    step: 2,
    title: "Install the SDK",
    description: "Add the MCE SDK to your project with npm, yarn, or pnpm.",
    code: `npm install @mesocrats/mce-sdk`,
    language: "bash",
  },
  {
    step: 3,
    title: "Make your first call",
    description: "Initialize the client and verify your connection.",
    code: `import { MCE } from "@mesocrats/mce-sdk";

const mce = new MCE({
  apiKey: process.env.MCE_API_KEY,
});

const status = await mce.health.check();
console.log(status); // { status: "ok", version: "1.0.0" }`,
    language: "typescript",
  },
  {
    step: 4,
    title: "Generate a report",
    description: "Create your first FEC-compliant filing in under 10 lines.",
    code: `const report = await mce.compliance.generateReport({
  committeeId: "C00123456",
  reportType: "Q1",
  year: 2026,
  format: "fec",
});

// Download the .fec file
await report.download("./filings/Q1-2026.fec");`,
    language: "typescript",
  },
];

function QuickStartSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Quick start"
          title="From zero to first filing in 4 steps"
          subtitle="Get up and running with the MCE SDK in minutes."
        />

        <div className="space-y-8">
          {quickStartSteps.map((step) => (
            <div key={step.step} className="grid md:grid-cols-2 gap-6 items-start">
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#4374BA]/15 text-[#4374BA] flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
              <CodeBlock
                code={step.code}
                language={step.language}
                title={`Step ${step.step}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  OPEN SOURCE CTA                                                    */
/* ------------------------------------------------------------------ */

function OpenSourceCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#0D0D18]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg md:text-xl text-gray-300 italic leading-relaxed">
          &quot;Political parties shouldn&apos;t be about competition. They
          should be about co-existence.&quot;
        </p>

        <div className="mt-10 p-6 rounded-xl border border-white/[0.06] bg-[#12121F]">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4374BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-sm font-semibold text-white">
              MIT License
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            The entire MCE platform is open source under the MIT license. Fork
            it, extend it, build on it -- no permission needed. Democracy works
            best when the tools are free.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/mesocrats/mesocrats-site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/[0.06] text-white font-medium text-sm hover:bg-white/[0.1] transition-colors border border-white/[0.06]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          <a
            href="/api-reference"
            className="inline-flex items-center border border-white/30 text-white bg-transparent font-semibold px-5 py-2.5 text-sm rounded-lg transition-colors hover:bg-[#6C3393] hover:border-[#6C3393]"
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function DeveloperHomePage() {
  return (
    <>
      <HeroSection />
      <TwoPathsSection />
      <ProductCatalogSection />
      <QuickStartSection />
      <OpenSourceCTA />
    </>
  );
}
