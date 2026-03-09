import type { MetadataRoute } from "next";

const siteUrl = "https://mesocrats.org";

const policySlugs = [
  "tax-reform",
  "digital-voting",
  "healthcare",
  "education",
  "government-reform",
  "housing",
  "term-limits",
  "criminal-justice",
  "energy-and-environment",
  "immigration",
  "national-security",
  "gun-reform",
  "polis-doctorate",
  "veterans",
  "lgb-rights",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/party/mission`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/about/story`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/idea`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about/leadership`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/platform`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/platform/policies`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/platform/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/ccx`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/ccx/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/ccx/ideas`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/ccx/permanent-panels`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/ccx/permanent-panels/free-expression`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/ccx/permanent-panels/religion`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/party/the-corporation`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/involved/join`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/involved/volunteer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/candidates/run`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/donate`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/disclosures`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Policy pages + white paper sub-routes
  const policyPages: MetadataRoute.Sitemap = policySlugs.flatMap((slug) => [
    {
      url: `${siteUrl}/platform/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${siteUrl}/platform/${slug}/white-paper`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]);

  return [...staticPages, ...policyPages];
}
