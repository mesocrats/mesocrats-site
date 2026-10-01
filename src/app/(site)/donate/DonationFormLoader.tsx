// src/app/(site)/donate/DonationFormLoader.tsx
// Client boundary that lazy-loads the Stripe-backed form.
//
// next/dynamic with ssr:false is only honored inside a Client Component. In a
// Server Component, Next eagerly adds the referenced client module to the
// page's chunk graph, which would ship Stripe.js to the paused page. Keeping
// the dynamic() call here means the Stripe chunk is fetched only when this
// component actually mounts, i.e. only when donations are open.

'use client';

import dynamic from 'next/dynamic';

const DonationForm = dynamic(() => import('./DonationForm'), { ssr: false });

export default function DonationFormLoader() {
  return <DonationForm />;
}
