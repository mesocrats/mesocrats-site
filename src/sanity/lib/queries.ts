// src/sanity/lib/queries.ts
//
// All GROQ queries for fetching content from Sanity.
// Centralized here so they're easy to find and maintain.

// ============================================================
// SITE SETTINGS (singleton)
// ============================================================

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0] {
    missionStatement,
    missionStatementShort,
    missionBarText,
    primaryTagline,
    secondaryTaglines,
    fecDisclaimer,
    copyrightText,
    footerColumns[] {
      heading,
      links[] { label, url },
    },
    socialLinks[] {
      platform,
      url,
      handle,
    },
    "heroImage": heroImage.asset->url,
    livingPlatformHeadline,
    livingPlatformBody,
    livingPlatformCtas[] { label, url },
  }
`

// ============================================================
// HOMEPAGE
// ============================================================

export const homepageQuery = `
  *[_type == "page" && slug.current == "home"][0] {
    title,
    heroEyebrow,
    heroHeadline,
    heroSubheadline,
    heroCta1Label,
    heroCta1Link,
    heroCta2Label,
    heroCta2Link,
    "heroImage": heroImage.asset->url,
    imageCredit,
    sections[] {
      _type,
      _key,
      label,
      headline,
      subheadline,
      body,
      cards[] {
        icon,
        headline,
        body,
        linkText,
        linkUrl,
      },
      ctaLabel,
      ctaLink,
      secondaryLabel,
      secondaryLink,
      linkText,
      linkUrl,
    }
  }
`

// ============================================================
// POLICY PAGES
// ============================================================

// Get all policy pages (for the Platform Overview grid)
export const allPolicyPagesQuery = `
  *[_type == "policyPage"] | order(order asc) {
    _id,
    title,
    slug,
    headline,
    tagline,
    icon,
    category,
    order,
    summaryDescription,
  }
`

// Get a single policy page by slug
export const policyPageBySlugQuery = `
  *[_type == "policyPage" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    headline,
    tagline,
    icon,
    category,
    "heroImage": heroImage.asset->url,
    imageCredit,
    realitySection,
    othersSaySection,
    whereWeStandSection,
    throughLineSection,
    whatItMeansSection,
    livingPlatformCallout,
    seo {
      metaTitle,
      metaDescription,
    },
  }
`

// ============================================================
// GENERIC PAGES (Mission, Story, Convention X, etc.)
// ============================================================

export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    heroHeadline,
    heroSubheadline,
    heroEyebrow,
    heroCta1Label,
    heroCta1Link,
    heroCta2Label,
    heroCta2Link,
    "heroImage": heroImage.asset->url,
    imageCredit,
    content,
    sections[] {
      _type,
      _key,
      label,
      headline,
      subheadline,
      body,
      cards[] {
        icon,
        headline,
        body,
        linkText,
        linkUrl,
      },
      ctaLabel,
      ctaLink,
      secondaryLabel,
      secondaryLink,
      linkText,
      linkUrl,
    },
    seo {
      metaTitle,
      metaDescription,
      ogImage,
    },
  }
`

// ============================================================
// FAQ
// ============================================================

export const allFaqEntriesQuery = `
  *[_type == "faqEntry"] | order(order asc) {
    _id,
    question,
    answer,
    order,
    category,
  }
`

// ============================================================
// NEWS / BLOG
// ============================================================

// Latest N posts (for homepage, sidebar, etc.)
export const latestNewsQuery = `
  *[_type == "newsPost" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...$limit] {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    category,
    "author": author->{ name, title, "image": image.asset->url },
    "coverImage": coverImage.asset->url,
  }
`

// Single news post by slug
export const newsPostBySlugQuery = `
  *[_type == "newsPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    publishedAt,
    category,
    "author": author->{ name, title, "image": image.asset->url },
    "coverImage": coverImage.asset->url,
    seo {
      metaTitle,
      metaDescription,
      ogImage,
    },
  }
`

// All news posts (for the news landing page)
export const allNewsPostsQuery = `
  *[_type == "newsPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    category,
    "author": author->{ name, title, "image": image.asset->url },
    "coverImage": coverImage.asset->url,
  }
`

// ============================================================
// TEAM / LEADERSHIP
// ============================================================

export const allTeamMembersQuery = `
  *[_type == "teamMember"] | order(order asc) {
    _id,
    name,
    title,
    "image": image.asset->url,
    order,
    socialLinks,
  }
`

// Single team member by name
export const teamMemberByNameQuery = `
  *[_type == "teamMember" && name == $name][0] {
    _id,
    name,
    title,
    "image": image.asset->url,
  }
`

// ============================================================
// FORM PAGE CONTENT
// ============================================================

export const formPageContentQuery = `
  *[_type == "formPageContent" && formType == $formType][0] {
    _id,
    formType,
    heroHeadline,
    heroSubheadline,
    "heroImage": heroImage.asset->url,
    imageCredit,
    bodyContent,
    cards[] {
      icon,
      headline,
      body,
    },
    ctaLabel,
    legalText,
    confirmationHeadline,
    confirmationBody,
  }
`
