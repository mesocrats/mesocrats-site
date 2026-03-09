import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "White Papers | The Mesocratic Party",
  description:
    "Read the evidence behind every position. Download Mesocratic Party white papers on tax reform, healthcare, education, and more.",
};

interface WhitePaper {
  category: string;
  title: string;
  summary: string;
  pdfPath: string;
  panelHref?: string;
}

const papers: WhitePaper[] = [
  {
    category: "OUR POLITICS",
    title: "Our Politics",
    summary:
      "The Mesocratic political framework — why neither left nor right has the answer, and what the radical center actually means.",
    pdfPath: "/documents/MP_The_Politiverse_v1.pdf",
    panelHref: "/party/politics",
  },
  {
    category: "THE CORPORATION",
    title: "The Corporation and the Republic",
    summary:
      "How two companies came to control American political infrastructure — and what the Mesocratic Party intends to do about it.",
    pdfPath: "/documents/MP_The_Corporation_v1.pdf",
    panelHref: "/party/the-corporation",
  },
  {
    category: "TAX REFORM",
    title: "The 15% Plan",
    summary:
      "One rate, no loopholes. A flat 15% tax on all income — individual and corporate — that eliminates deductions, simplifies the code, and funds the platform.",
    pdfPath: "/documents/MP_The_15_Percent_Plan_v2.pdf",
  },
  {
    category: "HEALTHCARE",
    title: "Healthcare for Every American",
    summary:
      "Universal baseline coverage, drug pricing reform, and a public option that competes on merit.",
    pdfPath: "/documents/MP_The_Two_Tier_Plan_v1.pdf",
  },
  {
    category: "DIGITAL VOTING",
    title: "Digital Voting & the Civic Platform",
    summary:
      "A secure, accessible mobile voting platform backed by modern identity verification.",
    pdfPath: "/documents/MP_The_Civic_Platform_v2.pdf",
  },
  {
    category: "EDUCATION",
    title: "Education Reform",
    summary:
      "Free public education Pre-K through bachelor's degree. $100K teacher salaries. Funded by the 15% Plan.",
    pdfPath: "/documents/MP_The_Education_Baseline_v2.pdf",
  },
  {
    category: "GOVERNMENT REFORM",
    title: "Government Reform",
    summary:
      "Term limits, higher pay, a stock market ban for Congress, and mandatory worker board representation.",
    pdfPath: "/documents/MP_The_Accountability_Framework_v1.pdf",
  },
  {
    category: "IMMIGRATION",
    title: "Immigration Reform",
    summary:
      "Secure borders, mandatory E-Verify, streamlined legal pathways, and earned status for long-term residents.",
    pdfPath: "/documents/MP_Secure_and_Streamlined_v1.pdf",
  },
  {
    category: "NATIONAL SECURITY",
    title: "National Security",
    summary:
      "The strongest military on earth, funded with accountability. AI investment, alliances strengthened.",
    pdfPath: "/documents/MP_Strong_and_Accountable_v1.pdf",
  },
  {
    category: "CRIMINAL JUSTICE",
    title: "Criminal Justice Reform",
    summary:
      "Fully funded police, end mandatory minimums for nonviolent offenses, marijuana reform, record-sealing.",
    pdfPath: "/documents/MP_Safe_and_Fair_v1.pdf",
  },
  {
    category: "ENERGY & ENVIRONMENT",
    title: "Energy & the Environment",
    summary:
      "Clean energy acceleration, nuclear, one-year permit shot-clock, and a worker transition fund.",
    pdfPath: "/documents/MP_The_Energy_Race_v1.pdf",
  },
  {
    category: "HOUSING",
    title: "Housing Reform",
    summary:
      "Build more homes, ban institutional investors from single-family, and raise the minimum wage to $25/hr.",
    pdfPath: "/documents/MP_Build_More_Homes_v1.pdf",
  },
  {
    category: "VETERANS",
    title: "Veterans Policy",
    summary:
      "7-day VA access, digitized records, mental health surge, GI Bill protection, 12-month transition planning.",
    pdfPath: "/documents/MP_The_Service_Standard_v1.pdf",
  },
  {
    category: "TERM LIMITS",
    title: "Term Limits",
    summary:
      "12-year maximum for House and Senate. Prospective. Voluntary Mesocratic pledge until the amendment passes.",
    pdfPath: "/documents/MP_12_Years_and_Out_v1.pdf",
  },
  {
    category: "POLIS DOCTORATE",
    title: "The Polis Doctorate",
    summary:
      "A professional credential for federal office — free, accessible, nonpartisan. Qualify before you govern.",
    pdfPath: "/documents/MP_Qualified_to_Govern_v1.pdf",
  },
  {
    category: "LGB RIGHTS",
    title: "LGB Rights",
    summary:
      "Marriage equality, equal adoption rights, federal anti-discrimination protections.",
    pdfPath: "/documents/MP_Equal_Under_the_Law_v1.pdf",
  },
  {
    category: "GUN REFORM",
    title: "Responsible Gun Reform",
    summary:
      "Universal background checks, red-flag laws, safe storage. Preserve lawful ownership. No bans. No registry.",
    pdfPath: "/documents/MP_Responsible_and_Protected_v1.pdf",
  },
  {
    category: "PERMANENT PANEL — FIRST AMENDMENT",
    title: "Free Expression and the Open Society",
    summary:
      "The right to speak, criticize, offend, satirize, and dissent belongs to everyone — not just those currently in favor.",
    pdfPath: "/documents/MP_Free_Expression_v1.pdf",
    panelHref: "/ccx/permanent-panels/free-expression",
  },
  {
    category: "PERMANENT PANEL — FIRST AMENDMENT",
    title: "Religion and the Open Society",
    summary:
      "Four principles for governing in a country where faith is real, powerful, and not going anywhere.",
    pdfPath: "/documents/MP_Religion_v1.pdf",
    panelHref: "/ccx/permanent-panels/religion",
  },
];

export default function ResearchPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-accent text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="inline-block bg-white text-accent rounded-full px-3 py-1 text-sm uppercase tracking-[0.2em] font-extrabold mb-4">
            MESOCRATIC RESEARCH
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold mb-4">
            White Papers.
          </h1>
          <p className="text-lg font-semibold text-white/90">
            Read the evidence behind every position.
          </p>
        </div>
      </section>

      {/* Accent divider bar */}
      <div className="h-1 bg-accent" />

      {/* Cards grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((paper) => (
            <div
              key={paper.title}
              className="bg-gray-light rounded-lg p-8 flex flex-col"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                {paper.category}
              </span>
              <h3 className="text-xl font-bold mb-3">{paper.title}</h3>
              <p className="text-sm text-primary/70 leading-relaxed flex-1">
                {paper.summary}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {paper.panelHref && (
                  <Link
                    href={paper.panelHref}
                    className="text-secondary font-semibold text-sm"
                  >
                    Read More &rarr;
                  </Link>
                )}
                <a
                  href={paper.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary font-semibold text-sm"
                >
                  Download PDF{!paper.panelHref && " →"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
