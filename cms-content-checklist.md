# CMS Content Checklist

Use this guide to populate every CMS-driven field in Sanity Studio.
Each field listed below currently falls back to hardcoded text.
Once you fill the field in the CMS, the hardcoded fallback is ignored.

> **Legend**
> - **Doc type** = Sanity document type (`page`, `policyPage`, `siteSettings`, `formPageContent`, etc.)
> - **Slug / Key** = the slug or identifier used to look up the document
> - **CMS Field** = the field name in Sanity Studio
> - **Fallback** = what currently displays if the CMS field is empty

---

## 1. Homepage

**Doc type:** `page` | **Slug:** `home`

### Hero (Hero tab)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroEyebrow` | "The Mesocratic Party" |
| 2 | `heroHeadline` | "America Meets Here" |
| 3 | `heroSubheadline` | "We're not left. We're not right. We're the people in the middle who actually keep this country running. And we finally have a party." |
| 4 | `heroImage` | Solid `bg-accent` background (no image) |
| 5 | `imageCredit` | Nothing displayed |
| 6 | `heroCta1Label` | "JOIN US" |
| 7 | `heroCta1Link` | "/involved/join" |
| 8 | `heroCta2Label` | "SEE WHERE WE STAND" |
| 9 | `heroCta2Link` | "/platform" |

### Sections (Content tab) — `sections[]` array

**Card Section** (policy highlights):

| # | CMS Field | Fallback |
|---|-----------|----------|
| 10 | `cardSection.headline` | "Where We Stand" |
| 11 | `cardSection.subheadline` | "Real positions. No hedging. Here's where the Mesocratic Party stands on the issues that matter most to the middle class." |
| 12 | `cardSection.cards` (array) | 3 hardcoded cards: Healthcare ("See a Doctor. Not a Bill."), Tax Reform ("One Rate. No Loopholes. Done."), Digital Voting ("Your Vote. Your Phone. Your Democracy.") |

**CTA Section** (CCX callout):

| # | CMS Field | Fallback |
|---|-----------|----------|
| 13 | `ctaSection.label` | "May 2027 · New Orleans, Louisiana" |
| 14 | `ctaSection.headline` | "Constitutional Convention X" |
| 15 | `ctaSection.body` | Two paragraphs about CCX and delegates (see code for full text) |
| 16 | `ctaSection.ctaLabel` | "GET INVOLVED" |
| 17 | `ctaSection.ctaLink` | "/convention" |
| 18 | `ctaSection.secondaryLabel` | "Submit your ideas for the platform →" |
| 19 | `ctaSection.secondaryLink` | "/convention" |

**Text Section / Callout Block** (comparison section):

| # | CMS Field | Fallback |
|---|-----------|----------|
| 20 | `textSection.headline` (compareSection) | "See How We Compare" |
| 21 | `textSection.subheadline` (compareSection) | "Pick an issue. See where the Democrats hedge, the Republicans deflect, and the Mesocratic Party actually stands." |

### SEO (SEO tab)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 22 | `seo.metaTitle` | "Mesocratic Party" (from layout) |
| 23 | `seo.metaDescription` | (none set) |

### Also uses Site Settings

| # | CMS Field (siteSettings) | Fallback |
|---|--------------------------|----------|
| 24 | `missionBarText` | "The middle class is the greatest invention in American history. It wasn't an accident..." |
| 25 | Latest 3 `newsPost` documents | 3 hardcoded articles: launch announcement, convention dates, platform preview |

---

## 2. Mission Page (`/party/mission`)

**Doc type:** `page` | **Slug:** `mission`

### Hero

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroEyebrow` | "About" |
| 2 | `heroHeadline` | "Our Mission" |
| 3 | `heroSubheadline` | "Why we exist and what we're building." |
| 4 | `heroImage` | Solid `bg-accent` background |
| 5 | `imageCredit` | Nothing displayed |

### Body Content

| # | CMS Field | Fallback |
|---|-----------|----------|
| 6 | `content` (Portable Text) | Full hardcoded page: "The Belief", "What Mesocratic Means", "What We Are / What We're Not", "The Fulcrum", "Mission Statement", "The Mesocratic National Committee" (EIN, state, type) |

### SEO

| # | CMS Field | Fallback |
|---|-----------|----------|
| 7 | `seo.metaTitle` | "Our Mission" |
| 8 | `seo.metaDescription` | "The Mesocratic Party — why we exist and what we're building." |

---

## 3. Story Page (`/about/story`)

**Doc type:** `page` | **Slug:** `story`

### Hero

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroEyebrow` | "About" |
| 2 | `heroHeadline` | "Our Story" |
| 3 | `heroSubheadline` | "How the Mesocratic Party came to be." |
| 4 | `heroImage` | Solid `bg-accent` background |
| 5 | `imageCredit` | Nothing displayed |

### Body Content

| # | CMS Field | Fallback |
|---|-----------|----------|
| 6 | `content` (Portable Text) | Two hardcoded sections: "The Problem" and "The Idea" |

### Founder Bio

| # | CMS Field | Fallback |
|---|-----------|----------|
| 7 | `teamMember` (name: "Jack Karavich") `.image` | No image shown |
| 8 | `teamMember` (name: "Jack Karavich") `.bio` | Hardcoded 3-paragraph founder bio |

### Timeline (Card Section)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 9 | `cardSection.cards` | 5 hardcoded timeline items: 2024 (drafting), 2025 (MNC formed), 2025 (site launches), 2026 (state organizing), 2027 (CCX convenes) |

### SEO

| # | CMS Field | Fallback |
|---|-----------|----------|
| 10 | `seo.metaTitle` | "Our Story" |
| 11 | `seo.metaDescription` | "How the Mesocratic Party came to be." |

---

## 4. FAQ Page (`/about/faq`)

**Doc type:** `faqEntry` (multiple documents)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | All `faqEntry` documents | 11 hardcoded Q&A pairs (What is the Mesocratic Party?, What does "Mesocratic" mean?, Is this a third party?, Are you centrist?, How do I join?, What is Convention X?, How do I become a delegate?, Can I run for office?, How is the party funded?, Is this real?, How can I help?) |

---

## 5. Platform Overview (`/platform`)

**Doc type:** `page` | **Slug:** `platform-overview`

### Hero

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroEyebrow` | "Platform" |
| 2 | `heroHeadline` | "This Is What We Stand For." |
| 3 | `heroSubheadline` | "Real positions. Real numbers. No hedging." |
| 4 | `heroImage` | Solid `bg-accent` background |
| 5 | `imageCredit` | Nothing displayed |

### Callout Block

| # | CMS Field | Fallback |
|---|-----------|----------|
| 6 | `calloutBlock.label` | "A Platform Built by the People" |
| 7 | `calloutBlock.body` | Long paragraph about platform governance and CCX |
| 8 | `calloutBlock.linkText` | "How Our Platform Works →" |
| 9 | `calloutBlock.linkUrl` | "/platform/how-it-works" |

### Policy Cards

| # | CMS Field | Fallback |
|---|-----------|----------|
| 10 | All `policyPage` documents | 15 hardcoded policy cards: Healthcare, Tax Reform, Digital Voting, Education, Government Reform, Immigration, National Security, Criminal Justice, Energy & Environment, Housing, Veterans, Term Limits, Polis Doctorate, LGB Rights, Gun Reform |

### CTA Section

| # | CMS Field | Fallback |
|---|-----------|----------|
| 11 | `ctaSection.body` | "Want to shape these positions? Join the party and make your voice heard at Convention X." |
| 12 | `ctaSection.ctaLabel` | "Learn About Convention X" |
| 13 | `ctaSection.ctaLink` | "/convention" |

### Also uses Site Settings

| # | CMS Field (siteSettings) | Fallback |
|---|--------------------------|----------|
| 14 | `livingPlatformHeadline` | "This Is a Living Platform" |
| 15 | `livingPlatformBody` | "This position is a starting point. The Mesocratic Party's platform is written, debated, and ratified by its members at Constitutional Convention X, held annually in New Orleans every May." |
| 16 | `livingPlatformCtas` | 4 links: Join the Party, Submit an Idea, Learn about CCX, How Our Platform Works |

---

## 6. How It Works (`/platform/how-it-works`)

**Doc type:** `page` | **Slug:** `how-it-works`

### Hero

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "This Platform Belongs to You." |
| 2 | `heroSubheadline` | "Every position on this site is a starting point. The Mesocratic Party's platform is written, debated, and ratified by its members — not by politicians, not by donors, and not by party insiders." |
| 3 | `heroImage` | Solid `bg-accent` background |
| 4 | `imageCredit` | Nothing displayed |

### Body Content

| # | CMS Field | Fallback |
|---|-----------|----------|
| 5 | `content` (Portable Text) | Full hardcoded page: "The Problem with Every Other Party", "How It Works" (3 numbered subsections: Founder's Starting Point, CCX, Digital Engagement), "What This Means for MP Politicians", "Why This Matters" (3 callout cards) |

### CTA Section

| # | CMS Field | Fallback |
|---|-----------|----------|
| 6 | `ctaSection.ctaLabel` | "Join the Party — Your Voice Starts Here" |
| 7 | `ctaSection.ctaLink` | "/involved/join" |
| 8 | `ctaSection.secondaryLabel` | "Learn about Constitutional Convention X →" |
| 9 | `ctaSection.secondaryLink` | "/convention" |
| 10 | `ctaSection.linkText` | "Submit a Policy Idea →" |
| 11 | `ctaSection.linkUrl` | "/convention" |

### SEO

| # | CMS Field | Fallback |
|---|-----------|----------|
| 12 | `seo.metaTitle` | "How Our Platform Works" |
| 13 | `seo.metaDescription` | "The Mesocratic Party's platform is written, debated, and ratified by its members." |

---

## 7. Policy Detail Pages (`/platform/[slug]`)

**Doc type:** `policyPage` | **Slug:** varies per policy

### Per-Policy Fields

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `headline` | (none — page 404s if document missing) |
| 2 | `tagline` | Nothing displayed |
| 3 | `heroImage` | Solid `bg-gray-900` background |
| 4 | `imageCredit` | Nothing displayed |
| 5 | `realitySection` (Portable Text) | Section hidden if empty |
| 6 | `othersSaySection` (Portable Text) | Section hidden if empty |
| 7 | `whereWeStandSection` (Portable Text) | Section hidden if empty |
| 8 | `whatItMeansSection` (Portable Text) | Section hidden if empty |
| 9 | `livingPlatformCallout.useDefault` | Uses site settings defaults |
| 10 | `livingPlatformCallout.customText` | Falls back to `siteSettings.livingPlatformBody` |

### SEO

| # | CMS Field | Fallback |
|---|-----------|----------|
| 11 | `seo.metaTitle` | "{title} | Mesocratic Party" |
| 12 | `seo.metaDescription` | "{tagline}" or "The Mesocratic Party's position on {title}" |

### Also uses Site Settings

| # | CMS Field (siteSettings) | Fallback |
|---|--------------------------|----------|
| 13 | `fecDisclaimer` | "Paid for by the Mesocratic National Committee. Not authorized by any candidate or candidate's committee." |
| 14 | `livingPlatformHeadline` | "THIS IS A LIVING PLATFORM" |
| 15 | `livingPlatformBody` | "The position on this page is a starting point..." |
| 16 | `livingPlatformCtas` | 4 links: Join the Party, Submit an Idea, Learn about CCX, How Our Platform Works |

---

## 8. Convention Page (`/convention`)

**Doc type:** `page` | **Slug:** `convention`

### Hero

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroEyebrow` | "May 2027 · New Orleans, Louisiana" |
| 2 | `heroHeadline` | "Constitutional Convention X" |
| 3 | `heroSubheadline` | "Where the Mesocratic Party becomes official. 5,000 elected delegates. One binding platform. The people's convention." |
| 4 | `heroImage` | Solid `bg-accent` background |
| 5 | `imageCredit` | Nothing displayed |
| 6 | `heroCta1Label` | "REGISTER YOUR INTEREST" |
| 7 | `heroCta1Link` | "#register" |
| 8 | `heroCta2Label` | "Join the Party First" |
| 9 | `heroCta2Link` | "/involved/join" |

### Text Sections

| # | CMS Field | Fallback |
|---|-----------|----------|
| 10 | `sections[]` (textSection, 3 entries) | "Why New Orleans?", "What Is Constitutional Convention X?", "5,000 Delegates. 50 States. One Platform." (full paragraph content for each) |

### Card Sections

| # | CMS Field | Fallback |
|---|-----------|----------|
| 11 | 1st `cardSection.cards` (What Happens at CCX) | 3 cards: "Draft the Founding Tenets", "Debate & Ratify the Platform", "Elect Party Leadership" |
| 12 | 2nd `cardSection.cards` (How to Be There) | 3 cards: "Join the Party", "Run for State Rep (or Vote)", "Attend CCX in New Orleans" |

### CTA / Register Section

| # | CMS Field | Fallback |
|---|-----------|----------|
| 13 | `ctaSection.headline` | "Register Your Interest" |
| 14 | `ctaSection.body` | "Convention X details are still being finalized. Drop your info below and we'll keep you in the loop as dates, logistics, and delegate elections take shape." |

### SEO

| # | CMS Field | Fallback |
|---|-----------|----------|
| 15 | `seo.metaTitle` | "Convention X" |
| 16 | `seo.metaDescription` | "Constitutional Convention X — May 2027, New Orleans. 5,000 delegates ratify the Mesocratic Party's binding platform." |

---

## 9. Convention — Submit Ideas (`/convention/ideas`)

**Doc type:** `formPageContent` | **Form type:** `submit-ideas`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "Submit a Policy Idea" |
| 2 | `heroSubheadline` | "Have an idea that should be part of the Mesocratic platform? Tell us. Every submission is reviewed and the best ideas are forwarded to Convention X delegates." |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 3 | (uses heroHeadline) | "Submit a Policy Idea" |
| 4 | (uses heroSubheadline) | Same as #2 |

---

## 10. Convention — Register (`/convention/register`)

**Doc type:** `formPageContent` | **Form type:** `ccx-register`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "Register Your Interest" |
| 2 | `heroSubheadline` | "Convention X details are still being finalized. Drop your info below and we'll keep you in the loop." |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 3 | (uses heroHeadline) | "Register for Convention X" |
| 4 | (uses heroSubheadline) | Same as #2 |

---

## 11. Join Page (`/involved/join`)

**Doc type:** `formPageContent` | **Form type:** `join`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "This Is Your Party. Come Build It." |
| 2 | `heroSubheadline` | "Membership is free. It takes 30 seconds. And it means something — you're not just joining a mailing list, you're joining a movement to put the middle class back in charge of American politics." |
| 3 | `cards` (array) | 3 cards: "Have a Voice" (vote at CCX, shape platform), "Build Something" (not just signing up, building a party), "It's Free" (no dues, no donations required) |
| 4 | `bodyContent` (Portable Text) | Nothing displayed (section hidden if empty) |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 5 | (uses heroHeadline) | "Join" |
| 6 | (uses heroSubheadline) | Same as #2 |

### Always Hardcoded

| Field | Value |
|-------|-------|
| Cards section headline | "Why Join the Mesocratic Party" (not CMS-driven) |

---

## 12. Volunteer Page (`/involved/volunteer`)

**Doc type:** `formPageContent` | **Form type:** `volunteer`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "Volunteer" |
| 2 | `heroSubheadline` | "Pick a track. Use your skills. Help build this party from the ground up." |
| 3 | `cards` (array) | 6 tracks: "State Organizer", "Digital Ambassador", "Event & Outreach", "Ballot Access", "Content & Creative", "Skills-Based Volunteer" (each with icon + description) |
| 4 | `bodyContent` (Portable Text) | Nothing displayed (section hidden if empty) |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 5 | (uses heroHeadline) | "Volunteer" |
| 6 | (uses heroSubheadline) | Same as #2 |

### Always Hardcoded

| Field | Value |
|-------|-------|
| Tracks section headline | "Choose Your Track" (not CMS-driven) |

---

## 13. Run for Office (`/candidates/run`)

**Doc type:** `formPageContent` | **Form type:** `run`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "Run for Office" |
| 2 | `heroSubheadline` | "This country needs better options. You might be one of them. The Mesocratic Party is recruiting, training, and supporting candidates at every level." |
| 3 | `cards` (array) | 4 cards: "Platform & Positioning", "Organizing & Infrastructure", "Training & Development", "Brand & Identity" |
| 4 | `bodyContent` (Portable Text) | Hardcoded "Why Run as a Mesocrat?" section with multi-paragraph content |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 5 | (uses heroHeadline) | "Run for Office" |
| 6 | (uses heroSubheadline) | Same as #2 |

---

## 14. Contact Page (`/contact`)

**Doc type:** `formPageContent` | **Form type:** `contact`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "Contact Us" |
| 2 | `heroSubheadline` | "We're here. Reach out." |
| 3 | `cards` (array) | 3 contact entries: "General Inquiries" (info@mesocrats.org), "Press & Media" (press@mesocrats.org), "Candidates & Elected Officials" (candidates@mesocrats.org) |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 4 | (uses heroHeadline) | "Contact" |
| 5 | (uses heroSubheadline) | Same as #2 |

---

## 15. Donate Page (`/donate`)

**Doc type:** `formPageContent` | **Form type:** `donate`

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `heroHeadline` | "Fund the Middle Ground." |
| 2 | `heroSubheadline` | "Donations are coming soon. Drop your email and we'll let you know the moment we're ready to accept contributions." |
| 3 | `bodyContent` (Portable Text) | Hardcoded "coming soon" paragraphs about donation platform |
| 4 | `legalText` | "Paid for by the Mesocratic National Committee. Not authorized by any candidate or candidate's committee. Contributions are not tax-deductible." |

### SEO (metadata)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 5 | (uses heroHeadline) | "Donate" |
| 6 | (uses heroSubheadline) | Same as #2 |

---

## 16. News List (`/news`)

**Doc type:** `newsPost` (multiple documents)

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | All `newsPost` documents | 3 hardcoded articles: "The Mesocratic Party Is Here" (2025-06-01), "Convention X Dates Announced" (2025-05-15), "Platform Preview: Healthcare" (2025-05-01) |

### Always Hardcoded (no CMS fallback pattern)

| Field | Value |
|-------|-------|
| Page headline | "What's Happening" |
| Page subheadline | "News, updates, and announcements from the Mesocratic Party." |

---

## 17. News Detail (`/news/[slug]`)

**Doc type:** `newsPost` | **Slug:** varies

| # | CMS Field | Fallback |
|---|-----------|----------|
| 1 | `body` (Portable Text) | "Full article coming soon." |
| 2 | `seo.metaTitle` | Falls back to `post.title` |
| 3 | `seo.metaDescription` | Falls back to `post.excerpt` |

---

## Site Settings (Global)

**Doc type:** `siteSettings` (singleton)

These fields are used across multiple pages:

| # | CMS Field | Used On | Fallback |
|---|-----------|---------|----------|
| 1 | `missionBarText` | Homepage | "The middle class is the greatest invention in American history..." |
| 2 | `livingPlatformHeadline` | Platform overview, policy pages | "This Is a Living Platform" |
| 3 | `livingPlatformBody` | Platform overview, policy pages | "This position is a starting point..." |
| 4 | `livingPlatformCtas` | Platform overview, policy pages | 4 links (Join, Submit, CCX, How It Works) |
| 5 | `fecDisclaimer` | Policy pages, donate, footer | "Paid for by the Mesocratic National Committee..." |
| 6 | `footerColumns` | Footer | 4 columns with links (About, Get Involved, Resources, Legal) |
| 7 | `copyrightText` | Footer | Nothing (just omitted) |
| 8 | `socialLinks` | Footer | Empty array |

---

## Components with Hardcoded Content (No CMS)

These components have text that is **not** connected to the CMS at all:

### Header (`src/components/Header.tsx`)
- All navigation labels and links are hardcoded
- "Donate" button text is hardcoded

### HomeJoinDonate (`src/components/HomeJoinDonate.tsx`)
- "This Is Your Party. Come Build It." heading
- "Membership is free..." paragraph
- "Fund the Middle Ground." heading
- "We're building the donation platform now..." paragraphs
- Success messages ("You're In!", "You're on the list!")
- FEC disclaimer text

### LivingPlatformCallout (`src/components/LivingPlatformCallout.tsx`)
- Receives props from parent pages but has internal defaults:
  - Headline: "THIS IS A LIVING PLATFORM"
  - Body: "The position on this page is a starting point..."
  - CTAs: 4 links (Join, Submit, CCX, How It Works)
