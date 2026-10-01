// src/lib/donations.ts
// Single source of truth for the site-wide donations pause.
//
// The MNC Stripe account is closed and the committee's legal entity is being
// re-formed. While DONATIONS_PAUSED is true, /donate renders a paused notice,
// the donation API routes short-circuit before touching Stripe/Supabase/MCE,
// and every donate CTA is hidden or swapped.
//
// Un-pausing is a one-line flip of DONATIONS_PAUSED.

export const DONATIONS_PAUSED = true;
export const DONATIONS_NOTIFY_SOURCE = "donate-notify";
