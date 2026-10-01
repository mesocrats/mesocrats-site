// src/app/(site)/donate/page.tsx
// Server component. Holds no Stripe imports: while DONATIONS_PAUSED is true the
// Stripe-backed form is never imported, so Stripe.js never loads here.

import type { Metadata } from 'next';
import Link from 'next/link';
import { DONATIONS_PAUSED } from '@/lib/donations';
import NotifyForm from './NotifyForm';
import DonationFormLoader from './DonationFormLoader';

export const metadata: Metadata = DONATIONS_PAUSED
  ? {
      title: 'Donations Open Soon',
      robots: { index: false, follow: false },
    }
  : { title: 'Donate' };

function PausedDonations() {
  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Hero */}
      <section className="relative bg-[#1A1A2E] py-20 sm:py-28 overflow-hidden">
        {/* Diagonal gradient accent stripe */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'linear-gradient(135deg, #4374BA 0%, #6C3393 35%, #EE2C24 65%, #FDD023 100%)',
          }}
        />

        {/* Radial glow behind headline */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] sm:w-[800px] sm:h-[500px] opacity-30 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, #6C3393 0%, transparent 70%)',
          }}
        />

        {/* Decorative gradient blob - top-right */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #4374BA, transparent 70%)',
          }}
        />

        {/* Decorative gradient blob - bottom-left */}
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 sm:w-80 sm:h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #EE2C24, transparent 70%)',
          }}
        />

        {/* Multi-color accent bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1">
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(90deg, #4374BA 0%, #6C3393 33%, #EE2C24 66%, #FDD023 100%)',
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block rounded-full bg-white/90 text-[#6C3393] px-4 py-1 text-sm font-extrabold tracking-wide uppercase mb-6">
            Committee reorganization
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-5 leading-tight">
            Donations Open Soon.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            We&apos;re setting up the party&apos;s official organization and bank
            accounts. As soon as that&apos;s done, we&apos;ll start accepting
            donations. Until then, the best way to support the party is to join.
            It&apos;s free and takes 30 seconds.
          </p>
          <Link
            href="/involved/join"
            className="inline-block px-8 py-3.5 bg-[#FDD023] text-[#1A1A2E] font-bold text-lg rounded-md transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FDD023]/20"
          >
            JOIN THE PARTY
          </Link>
        </div>
      </section>

      {/* Gradient fade into dark section */}
      <div className="h-12 bg-gradient-to-b from-[#1A1A2E] to-[#1A1A1A]" />

      {/* Notify-me capture */}
      <section className="max-w-xl mx-auto px-6 py-12 sm:py-16">
        <NotifyForm />

        {/* FEC Disclaimer */}
        <div className="pt-8 mt-8 border-t border-[#333]">
          <p className="text-xs text-white/40 leading-relaxed">
            Paid for by the Mesocratic National Committee (mesocrats.org). Not
            authorized by any candidate or candidate&rsquo;s committee.
          </p>
          <p className="text-xs text-white/40 leading-relaxed mt-2">
            Contributions to the Mesocratic National Committee are not
            tax-deductible as charitable contributions for federal income tax
            purposes. Federal law requires political committees to report the
            name, mailing address, occupation, and employer for each individual
            whose contributions aggregate in excess of $200 in a calendar year.
            Contributions from corporations, labor unions, foreign nationals, and
            federal contractors are prohibited.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function DonatePage() {
  return DONATIONS_PAUSED ? <PausedDonations /> : <DonationFormLoader />;
}
