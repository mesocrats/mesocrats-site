// src/app/(site)/donate/DonationForm.tsx
// Stripe-backed donation form. Only imported when DONATIONS_PAUSED is false,
// so Stripe.js never loads on the paused page.

'use client';

import { useState, FormEvent } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  validateDonorInfo,
  validateDonationInfo,
  US_STATES,
  formatCents,
} from '@/lib/fec-compliance';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

const PRESET_AMOUNTS = [2500, 5000, 10000, 25000, 50000]; // cents

// Stripe Elements appearance - matches mesocrats.org dark theme
const stripeAppearance: StripeElementsOptions['appearance'] = {
  theme: 'night',
  variables: {
    colorPrimary: '#6C3393',
    colorBackground: '#2A2A2A',
    colorText: '#ffffff',
    colorTextSecondary: '#aaaaaa',
    colorDanger: '#EE2C24',
    fontFamily: 'Arial, Helvetica, sans-serif',
    spacingUnit: '4px',
    borderRadius: '6px',
  },
  rules: {
    '.Input': {
      border: '1px solid #444',
      backgroundColor: '#1A1A1A',
      padding: '12px',
    },
    '.Input:focus': {
      border: '1px solid #6C3393',
      boxShadow: '0 0 0 1px #6C3393',
    },
    '.Label': {
      color: '#cccccc',
    },
  },
};

function DonationFormFields() {
  const stripe = useStripe();
  const elements = useElements();

  // Form state
  const [amount, setAmount] = useState<number>(5000); // cents
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [employer, setEmployer] = useState('');
  const [occupation, setOccupation] = useState('');
  const [phone, setPhone] = useState('');

  const [citizenshipAttested, setCitizenshipAttested] = useState(false);
  const [personalFundsAttested, setPersonalFundsAttested] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ amount: string; chargeId: string } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  const effectiveAmount = isCustom
    ? Math.round(parseFloat(customAmount || '0') * 100)
    : amount;

  const handlePresetClick = (cents: number) => {
    setAmount(cents);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    // Allow only digits and one decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    setCustomAmount(cleaned);
    setIsCustom(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setWarnings([]);

    if (!stripe || !elements) {
      setErrors(['Payment system is loading. Please try again.']);
      return;
    }

    // Client-side validation
    const donorValidation = validateDonorInfo({
      firstName, lastName, email, addressLine1, addressLine2, city,
      state, zipCode, employer, occupation, phone,
    });

    const donationValidation = validateDonationInfo(
      { amountCents: effectiveAmount, frequency, citizenshipAttested, personalFundsAttested },
      0 // Server will check actual annual totals
    );

    const allErrors = [...donorValidation.errors, ...donationValidation.errors];
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    if (donationValidation.warnings.length > 0) {
      setWarnings(donationValidation.warnings);
    }

    setLoading(true);

    try {
      // Create payment method from card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setErrors(['Card input not found. Please refresh and try again.']);
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`,
            email,
            address: {
              line1: addressLine1,
              line2: addressLine2 || undefined,
              city,
              state,
              postal_code: zipCode,
              country: 'US',
            },
          },
        });

      if (stripeError || !paymentMethod) {
        setErrors([stripeError?.message || 'Failed to process card. Please try again.']);
        setLoading(false);
        return;
      }

      // Submit to our API
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          firstName, lastName, email,
          addressLine1, addressLine2, city, state, zipCode,
          employer, occupation, phone,
          amountCents: effectiveAmount,
          frequency,
          citizenshipAttested,
          personalFundsAttested,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.details || [data.error || 'Donation failed. Please try again.']);
        setLoading(false);
        return;
      }

      // Success
      setSuccess(true);
      setSuccessData({ amount: data.amount, chargeId: data.chargeId });
      if (data.warnings) setWarnings(data.warnings);
    } catch {
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success && successData) {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-[#2A2A3A] to-[#1A1A1A] py-20 sm:py-28">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-600/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
              Thank You.
            </h1>
            <p className="text-lg text-white/80 mb-2">
              Your {successData.amount} contribution has been processed.
            </p>
            <p className="text-sm text-white/60">
              A receipt has been sent to your email.
            </p>
          </div>
        </section>

        <div className="max-w-md mx-auto px-6 py-12 text-center">
          <a
            href="/platform"
            className="inline-block px-8 py-3 bg-[#4374BA] hover:bg-[#365f9a] text-white font-semibold rounded-md transition-colors"
          >
            Explore Our Platform
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* Hero */}
      <section className="relative bg-[#1A1A2E] py-20 sm:py-28 overflow-hidden">
        {/* Diagonal gradient accent stripe */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(135deg, #4374BA 0%, #6C3393 35%, #EE2C24 65%, #FDD023 100%)',
          }}
        />

        {/* Radial glow behind headline */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] sm:w-[800px] sm:h-[500px] opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, #6C3393 0%, transparent 70%)',
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
              background: 'linear-gradient(90deg, #4374BA 0%, #6C3393 33%, #EE2C24 66%, #FDD023 100%)',
            }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block rounded-full bg-white/90 text-[#6C3393] px-4 py-1 text-sm font-extrabold tracking-wide uppercase mb-6">
            Every dollar builds the party
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-5 leading-tight">
            Back the Middle.
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
            You&rsquo;re not donating to a candidate. You&rsquo;re building a party &mdash; and a movement that puts people over politics.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById('donation-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-block px-8 py-3.5 bg-[#FDD023] text-[#1A1A2E] font-bold text-lg rounded-md transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FDD023]/20"
          >
            Donate Now
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/powered-by-stripe-white.svg"
            alt="Powered by Stripe"
            className="mt-3 mx-auto opacity-70"
            style={{ width: 100, height: 'auto' }}
          />
        </div>
      </section>

      {/* Gradient fade into dark form section */}
      <div className="h-12 bg-gradient-to-b from-[#1A1A2E] to-[#1A1A1A]" />

      {/* Form */}
      <section id="donation-form" className="max-w-2xl mx-auto px-6 py-12 sm:py-16 scroll-mt-4">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Amount Selection */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">
              Donation Amount
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
              {PRESET_AMOUNTS.map((cents) => (
                <button
                  key={cents}
                  type="button"
                  onClick={() => handlePresetClick(cents)}
                  className={`py-3 px-2 rounded-md text-sm font-semibold transition-all ${
                    !isCustom && amount === cents
                      ? 'bg-[#6C3393] text-white ring-2 ring-[#6C3393] ring-offset-2 ring-offset-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-white/80 border border-[#444] hover:border-[#6C3393]'
                  }`}
                >
                  {formatCents(cents)}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Other amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                onFocus={() => setIsCustom(true)}
                className={`w-full pl-7 pr-4 py-3 bg-[#1A1A1A] border rounded-md text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#6C3393] ${
                  isCustom ? 'border-[#6C3393]' : 'border-[#444]'
                }`}
              />
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-3">
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['one-time', 'monthly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`py-3 rounded-md text-sm font-semibold transition-all ${
                    frequency === freq
                      ? 'bg-[#6C3393] text-white ring-2 ring-[#6C3393] ring-offset-2 ring-offset-[#1A1A1A]'
                      : 'bg-[#2A2A2A] text-white/80 border border-[#444] hover:border-[#6C3393]'
                  }`}
                >
                  {freq === 'one-time' ? 'One-Time' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          {/* Donor Information */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Your Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First Name *" value={firstName} onChange={setFirstName} autoComplete="given-name" />
              <Input label="Last Name *" value={lastName} onChange={setLastName} autoComplete="family-name" />
              <Input label="Email *" type="email" value={email} onChange={setEmail} autoComplete="email" className="sm:col-span-2" />
              <Input label="Street Address *" value={addressLine1} onChange={setAddressLine1} autoComplete="address-line1" className="sm:col-span-2" />
              <Input label="Apt / Suite" value={addressLine2} onChange={setAddressLine2} autoComplete="address-line2" />
              <Input label="City *" value={city} onChange={setCity} autoComplete="address-level2" />
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  autoComplete="address-level1"
                  className="w-full px-3 py-3 bg-[#1A1A1A] border border-[#444] rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3393] focus:border-transparent"
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <Input label="ZIP Code *" value={zipCode} onChange={setZipCode} autoComplete="postal-code" />
              <Input label="Employer *" value={employer} onChange={setEmployer} placeholder="Required by federal law" />
              <Input label="Occupation *" value={occupation} onChange={setOccupation} placeholder="Required by federal law" />
              <Input label="Phone" type="tel" value={phone} onChange={setPhone} autoComplete="tel" className="sm:col-span-2" />
            </div>
          </div>

          {/* Card Input */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Payment</h2>
            <div className="p-4 bg-[#1A1A1A] border border-[#444] rounded-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#ffffff',
                      '::placeholder': { color: '#666' },
                      iconColor: '#6C3393',
                    },
                    invalid: { color: '#EE2C24' },
                  },
                }}
              />
            </div>
            <div className="flex justify-end mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/stripe-wordmark-white.svg"
                alt="Stripe"
                className="opacity-50"
                style={{ width: 33, height: 'auto' }}
              />
            </div>
          </div>

          {/* Attestations */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-2">Legal Certifications</h2>

            <Checkbox
              checked={citizenshipAttested}
              onChange={setCitizenshipAttested}
              label="I am a United States citizen or permanent resident alien."
            />

            <Checkbox
              checked={personalFundsAttested}
              onChange={setPersonalFundsAttested}
              label="This contribution is made from my own personal funds and is not from the general treasury funds of a corporation, labor organization, or national bank."
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-md">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-red-300">{err}</p>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-md">
              {warnings.map((w, i) => (
                <p key={i} className="text-sm text-yellow-300">{w}</p>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full py-4 border-2 border-white text-white bg-transparent font-bold text-lg rounded-md transition-all duration-200 hover:bg-[#FDD023] hover:border-[#FDD023] hover:text-[#1A1A2E] active:scale-[0.98] disabled:border-[#666] disabled:text-[#666] disabled:hover:bg-transparent disabled:hover:border-[#666] disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Donate ${formatCents(effectiveAmount)}${frequency === 'monthly' ? '/month' : ''}`
            )}
          </button>

          {/* FEC Disclaimer */}
          <div className="pt-4 border-t border-[#333]">
            <p className="text-xs text-white/40 leading-relaxed">
              Paid for by the Mesocratic National Committee (mesocrats.org). Not authorized by any candidate or candidate&rsquo;s committee.
            </p>
            <p className="text-xs text-white/40 leading-relaxed mt-2">
              Contributions to the Mesocratic National Committee are not tax-deductible as charitable contributions for federal income tax purposes. Federal law requires political committees to report the name, mailing address, occupation, and employer for each individual whose contributions aggregate in excess of $200 in a calendar year. Contributions from corporations, labor unions, foreign nationals, and federal contractors are prohibited.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}

// === Helper Components ===

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-white/70 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-3 py-3 bg-[#1A1A1A] border border-[#444] rounded-md text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6C3393] focus:border-transparent"
      />
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-5 h-5 rounded border-[#444] bg-[#1A1A1A] text-[#6C3393] focus:ring-[#6C3393] focus:ring-offset-0 cursor-pointer"
      />
      <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
        {label}
      </span>
    </label>
  );
}

// === Page Export ===

export default function DonationForm() {
  return (
    <Elements
      stripe={stripePromise}
      options={{ appearance: stripeAppearance }}
    >
      <DonationFormFields />
    </Elements>
  );
}
