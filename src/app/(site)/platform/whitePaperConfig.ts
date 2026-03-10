export interface WhitePaperEntry {
  id: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  pdfPath: string;
}

export const whitePaperConfig: Record<string, WhitePaperEntry[]> = {
  "politics": [
    {
      id: "the-politiverse",
      eyebrow: "FRAMEWORK WHITE PAPER",
      headline: "The Politiverse",
      subheadline: "Why the Political Spectrum Failed America and What Replaces It",
      pdfPath: "/documents/MP_The_Politiverse_v1.pdf",
    },
  ],
  "tax-reform": [
    {
      id: "the-15-percent-plan",
      eyebrow: "TAX REFORM WHITE PAPER",
      headline: "The 15% Plan",
      subheadline: "A Unified Flat Tax for All American Income",
      pdfPath: "/documents/MP_The_15_Percent_Plan_v2.pdf",
    },
    {
      id: "american-family-growth-credit",
      eyebrow: "FAMILY TAX CREDIT WHITE PAPER",
      headline: "The American Family Growth Credit",
      subheadline: "The Most Aggressive Pro-Family Tax Policy in the Developed World",
      pdfPath: "/documents/MP_American_Family_Growth_Credit_v1.pdf",
    },
    {
      id: "corporate-codetermination-act",
      eyebrow: "WORKERS' RIGHTS WHITE PAPER",
      headline: "The Corporate Codetermination Act",
      subheadline: "Worker Representation on Corporate Boards — Modeled on Germany's Proven System",
      pdfPath: "/documents/MP_Corporate_Codetermination_Act_v2.pdf",
    },
  ],
  "digital-voting": [
    {
      id: "the-civic-platform",
      eyebrow: "DIGITAL VOTING WHITE PAPER",
      headline: "The Civic Platform",
      subheadline: "A Secure, Accessible, and Verifiable Digital Voting System for American Democracy",
      pdfPath: "/documents/MP_The_Civic_Platform_v2.pdf",
    },
  ],
  "healthcare": [
    {
      id: "the-two-tier-plan",
      eyebrow: "HEALTHCARE WHITE PAPER",
      headline: "The Two-Tier Plan",
      subheadline: "Universal Baseline Coverage with a Private Supplemental Market",
      pdfPath: "/documents/MP_The_Two_Tier_Plan_v1.pdf",
    },
  ],
  "education": [
    {
      id: "the-education-baseline",
      eyebrow: "EDUCATION WHITE PAPER",
      headline: "The Education Baseline",
      subheadline: "Free Public Education Through a Bachelor's Degree — and the Math to Pay for It",
      pdfPath: "/documents/MP_The_Education_Baseline_v2.pdf",
    },
  ],
  "government-reform": [
    {
      id: "the-accountability-framework",
      eyebrow: "GOVERNMENT REFORM WHITE PAPER",
      headline: "The Accountability Framework",
      subheadline: "Six Interlocking Reforms to Fix the Broken Incentive Structure of American Government",
      pdfPath: "/documents/MP_The_Accountability_Framework_v1.pdf",
    },
    {
      id: "corporate-codetermination-act",
      eyebrow: "WORKERS' RIGHTS WHITE PAPER",
      headline: "The Corporate Codetermination Act",
      subheadline: "Worker Representation on Corporate Boards — Modeled on Germany's Proven System",
      pdfPath: "/documents/MP_Corporate_Codetermination_Act_v2.pdf",
    },
  ],
  "housing": [
    {
      id: "build-more-homes",
      eyebrow: "HOUSING WHITE PAPER",
      headline: "Build More Homes",
      subheadline: "A National Strategy to End the Housing Shortage, Ban Institutional Buyers, and Restore Affordability",
      pdfPath: "/documents/MP_Build_More_Homes_v1.pdf",
    },
  ],
  "term-limits": [
    {
      id: "12-years-and-out",
      eyebrow: "TERM LIMITS WHITE PAPER",
      headline: "12 Years and Out",
      subheadline: "The Case for Congressional Term Limits and the End of the Permanent Political Class",
      pdfPath: "/documents/MP_12_Years_and_Out_v1.pdf",
    },
  ],
  "criminal-justice": [
    {
      id: "safe-and-fair",
      eyebrow: "CRIMINAL JUSTICE WHITE PAPER",
      headline: "Safe and Fair",
      subheadline: "Evidence-Based Criminal Justice Reform That Reduces Crime and Saves Money",
      pdfPath: "/documents/MP_Safe_and_Fair_v1.pdf",
    },
  ],
  "energy-and-environment": [
    {
      id: "the-energy-race",
      eyebrow: "ENERGY & ENVIRONMENT WHITE PAPER",
      headline: "The Energy Race",
      subheadline: "A National Innovation Strategy for Next-Generation Energy Dominance",
      pdfPath: "/documents/MP_The_Energy_Race_v1.pdf",
    },
  ],
  "immigration": [
    {
      id: "secure-and-streamlined",
      eyebrow: "IMMIGRATION WHITE PAPER",
      headline: "Secure and Streamlined",
      subheadline: "A Border Security and Legal Immigration Framework That Actually Works",
      pdfPath: "/documents/MP_Secure_and_Streamlined_v1.pdf",
    },
  ],
  "national-security": [
    {
      id: "strong-and-accountable",
      eyebrow: "NATIONAL SECURITY WHITE PAPER",
      headline: "Strong and Accountable",
      subheadline: "A Modern Defense Strategy Built on Audit, Innovation, and Allied Burden-Sharing",
      pdfPath: "/documents/MP_Strong_and_Accountable_v1.pdf",
    },
  ],
  "gun-reform": [
    {
      id: "responsible-and-protected",
      eyebrow: "GUN REFORM WHITE PAPER",
      headline: "Responsible and Protected",
      subheadline: "Universal Background Checks, Due-Process Red-Flag Laws, and a Second Amendment That Works for Everyone",
      pdfPath: "/documents/MP_Responsible_and_Protected_v1.pdf",
    },
  ],
  "polis-doctorate": [
    {
      id: "qualified-to-govern",
      eyebrow: "POLIS DOCTORATE WHITE PAPER",
      headline: "Qualified to Govern",
      subheadline: "The Case for a Professional Credential for Federal Office",
      pdfPath: "/documents/MP_Qualified_to_Govern_v1.pdf",
    },
  ],
  "veterans": [
    {
      id: "the-service-standard",
      eyebrow: "VETERANS WHITE PAPER",
      headline: "The Service Standard",
      subheadline: "7-Day Access, Digital Modernization, and a Veterans System Built on Outcomes",
      pdfPath: "/documents/MP_The_Service_Standard_v1.pdf",
    },
  ],
  "lgb-rights": [
    {
      id: "equal-under-the-law",
      eyebrow: "LGB RIGHTS WHITE PAPER",
      headline: "Equal Under the Law",
      subheadline: "Marriage, Family, Anti-Discrimination Protections, and Religious Liberty — Without Contradiction",
      pdfPath: "/documents/MP_Equal_Under_the_Law_v1.pdf",
    },
  ],
  "the-corporation": [
    {
      id: "the-corporation",
      eyebrow: "PARTY WHITE PAPER",
      headline: "The Corporation and the Republic",
      subheadline: "How two companies came to control American political infrastructure -- and what the Mesocratic Party intends to do about it.",
      pdfPath: "/documents/MP_The_Corporation_v1.pdf",
    },
  ],
  "permanent-panels": [
    {
      id: "wp-free-expression",
      eyebrow: "PERMANENT PANEL -- FIRST AMENDMENT",
      headline: "Free Expression and the Open Society",
      subheadline: "The right to speak, criticize, offend, satirize, and dissent belongs to everyone -- not just those currently in favor.",
      pdfPath: "/documents/MP_Free_Expression_v2.pdf",
    },
    {
      id: "wp-religion",
      eyebrow: "PERMANENT PANEL -- FIRST AMENDMENT",
      headline: "Religion and the Open Society",
      subheadline: "Four principles for governing in a country where faith is real, powerful, and not going anywhere.",
      pdfPath: "/documents/MP_Religion_v2.pdf",
    },
  ],
};
