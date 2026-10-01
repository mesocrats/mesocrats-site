// src/app/(site)/donate/NotifyForm.tsx
// Email capture shown while donations are paused. Posts to /api/join with the
// donate-notify source tag so the list can be filtered out of member counts.

'use client';

import { useState, FormEvent } from 'react';
import { DONATIONS_NOTIFY_SOURCE } from '@/lib/donations';

export default function NotifyForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName || undefined,
          source: DONATIONS_NOTIFY_SOURCE,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-[#444] bg-[#2A2A2A] p-6 text-center">
        <p className="text-white font-semibold">
          You&apos;re on the list. We&apos;ll email you when donations reopen.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#444] bg-[#2A2A2A] p-6">
      <h2 className="text-lg font-semibold text-white mb-4">
        Tell me when donations reopen.
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="notify-email"
            className="block text-xs font-medium text-white/70 mb-1.5"
          >
            Email *
          </label>
          <input
            id="notify-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full px-3 py-3 bg-[#1A1A1A] border border-[#444] rounded-md text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6C3393] focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="notify-first-name"
            className="block text-xs font-medium text-white/70 mb-1.5"
          >
            First Name
          </label>
          <input
            id="notify-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            className="w-full px-3 py-3 bg-[#1A1A1A] border border-[#444] rounded-md text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6C3393] focus:border-transparent"
          />
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 border-2 border-white text-white bg-transparent font-bold rounded-md transition-all duration-200 hover:bg-[#FDD023] hover:border-[#FDD023] hover:text-[#1A1A2E] active:scale-[0.98] disabled:border-[#666] disabled:text-[#666] disabled:hover:bg-transparent disabled:hover:border-[#666] disabled:active:scale-100"
        >
          {loading ? 'SUBMITTING...' : 'NOTIFY ME'}
        </button>
      </form>
    </div>
  );
}
