// src/app/api/donate/route.ts
// Donation processing API route
// Per MP_Donation_System_Architecture_v1.docx Section 3 (Data Flow)

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { DONATIONS_PAUSED } from '@/lib/donations';
import { createClient } from '@supabase/supabase-js';
import { sendDonationReceipt } from '@/lib/donation-email';
import { writeAuditLog } from '@/lib/mce/audit';
import { recordStripeFee } from '@/lib/mce/stripe-fees';
import { checkAndSendFollowUp } from '@/lib/mce/best-efforts';
import {
  validateDonorInfo,
  validateDonationInfo,
  FEC_ANNUAL_LIMIT_CENTS,
  type DonorInfo,
  type DonationInfo,
} from '@/lib/fec-compliance';

// Supabase service role client (lazy to avoid build-time errors)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface DonateRequestBody {
  // Stripe
  paymentMethodId: string;

  // Donor info
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  employer: string;
  occupation: string;
  phone?: string;

  // Donation info
  amountCents: number;
  frequency: 'one-time' | 'monthly';

  // Attestations
  citizenshipAttested: boolean;
  personalFundsAttested: boolean;
}

export async function POST(request: NextRequest) {
  // Donations are paused site-wide: return before touching Stripe, Supabase,
  // or MCE. Nothing is written to the database before this point.
  if (DONATIONS_PAUSED) {
    return NextResponse.json(
      { error: 'Donations are temporarily paused.' },
      { status: 503, headers: { 'Retry-After': '86400' } }
    );
  }

  const supabase = getSupabase();
  try {
    const body: DonateRequestBody = await request.json();

    // === 1. SERVER-SIDE VALIDATION ===
    // Never trust client-side validation alone

    const donorInfo: DonorInfo = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      employer: body.employer,
      occupation: body.occupation,
      phone: body.phone,
    };

    const donorValidation = validateDonorInfo(donorInfo);
    if (!donorValidation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: donorValidation.errors },
        { status: 400 }
      );
    }

    // Check for existing donor to get annual totals
    let priorAnnualTotalCents = 0;
    const { data: existingDonor } = await supabase
      .from('donors')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingDonor) {
      const currentYear = new Date().getFullYear();
      const { data: annualTotal } = await supabase
        .from('donation_annual_totals')
        .select('total_cents')
        .eq('donor_id', existingDonor.id)
        .eq('year', currentYear)
        .single();

      priorAnnualTotalCents = annualTotal?.total_cents || 0;
    }

    const donationInfo: DonationInfo = {
      amountCents: body.amountCents,
      frequency: body.frequency,
      citizenshipAttested: body.citizenshipAttested,
      personalFundsAttested: body.personalFundsAttested,
    };

    const donationValidation = validateDonationInfo(donationInfo, priorAnnualTotalCents);
    if (!donationValidation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: donationValidation.errors },
        { status: 400 }
      );
    }

    // Hard block: annual aggregate limit (server-side enforcement)
    if (priorAnnualTotalCents + body.amountCents > FEC_ANNUAL_LIMIT_CENTS) {
      return NextResponse.json(
        {
          error: `This donation would exceed the $${(FEC_ANNUAL_LIMIT_CENTS / 100).toLocaleString()} annual contribution limit. Your current annual total is $${(priorAnnualTotalCents / 100).toLocaleString()}.`,
        },
        { status: 400 }
      );
    }

    // Duplicate detection: same amount + email within 60 seconds
    if (existingDonor) {
      const { data: recentDonation } = await supabase
        .from('donations')
        .select('created_at')
        .eq('donor_id', existingDonor.id)
        .eq('amount_cents', body.amountCents)
        .gte('created_at', new Date(Date.now() - 60_000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (recentDonation) {
        return NextResponse.json(
          { error: 'A duplicate donation was detected. Please wait a moment before trying again.' },
          { status: 409 }
        );
      }
    }

    // === 2. CREATE OR GET STRIPE CUSTOMER ===
    let stripeCustomerId: string | null = null;

    if (existingDonor) {
      const { data: donorRecord } = await supabase
        .from('donors')
        .select('stripe_customer_id')
        .eq('id', existingDonor.id)
        .single();
      stripeCustomerId = donorRecord?.stripe_customer_id || null;
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: body.email,
        name: `${body.firstName} ${body.lastName}`,
        address: {
          line1: body.addressLine1,
          line2: body.addressLine2 || undefined,
          city: body.city,
          state: body.state,
          postal_code: body.zipCode,
          country: 'US',
        },
        metadata: {
          employer: body.employer,
          occupation: body.occupation,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(body.paymentMethodId, {
      customer: stripeCustomerId,
    });

    // === 3. PROCESS PAYMENT ===
    let stripeChargeId: string;
    let stripeSubscriptionId: string | null = null;

    if (body.frequency === 'monthly') {
      // Create a price for the recurring donation amount
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: body.amountCents,
        recurring: { interval: 'month' },
        product_data: {
          name: 'Monthly Donation — Mesocratic National Committee',
        },
      });

      // Create subscription for recurring donations
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: price.id }],
        default_payment_method: body.paymentMethodId,
        metadata: {
          donor_email: body.email,
          employer: body.employer,
          occupation: body.occupation,
        },
      });

      stripeSubscriptionId = subscription.id;
      const invoice = subscription.latest_invoice;
      const invoiceObj =
        typeof invoice === 'string'
          ? await stripe.invoices.retrieve(invoice)
          : invoice;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stripeChargeId = (invoiceObj as any)?.payment_intent || subscription.id;
    } else {
      // One-time payment via PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amountCents,
        currency: 'usd',
        customer: stripeCustomerId,
        payment_method: body.paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        metadata: {
          donor_email: body.email,
          employer: body.employer,
          occupation: body.occupation,
        },
      });

      stripeChargeId = paymentIntent.id;

      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment was not completed. Please try again.' },
          { status: 402 }
        );
      }
    }

    // === 4. WRITE TO SUPABASE ===
    // Upsert donor
    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .upsert(
        {
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          address_line1: body.addressLine1,
          address_line2: body.addressLine2 || null,
          city: body.city,
          state: body.state,
          zip_code: body.zipCode,
          employer: body.employer,
          occupation: body.occupation,
          phone: body.phone || null,
          stripe_customer_id: stripeCustomerId,
        },
        { onConflict: 'stripe_customer_id' }
      )
      .select('id')
      .single();

    if (donorError || !donor) {
      console.error('[Supabase] Donor upsert error:', donorError);
      // Payment already processed — log but don't fail
    }

    // Insert donation record
    const isItemized =
      (priorAnnualTotalCents + body.amountCents) > 200_00;

    if (donor) {
      const { error: donationError } = await supabase.from('donations').insert({
        donor_id: donor.id,
        stripe_charge_id: stripeChargeId,
        stripe_subscription_id: stripeSubscriptionId,
        amount_cents: body.amountCents,
        frequency: body.frequency,
        status: 'succeeded',
        fec_itemized: isItemized,
        metadata: {
          citizenship_attested: body.citizenshipAttested,
          personal_funds_attested: body.personalFundsAttested,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      if (donationError) {
        console.error('[Supabase] Donation insert error:', donationError);
      }

      // Refresh materialized view
      const { error: refreshError } = await supabase.rpc('refresh_donation_totals');
      if (refreshError) {
        console.error('[Supabase] Failed to refresh donation totals:', refreshError);
      }
    }

    // === 5. MCE AUDIT LOG (fire-and-forget) ===
    if (donor) {
      const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
      writeAuditLog('donations', donor.id, 'create', null, {
        donor_id: donor.id,
        stripe_charge_id: stripeChargeId,
        stripe_subscription_id: stripeSubscriptionId,
        amount_cents: body.amountCents,
        frequency: body.frequency,
        status: 'succeeded',
        fec_itemized: isItemized,
        donor_email: body.email,
        donor_name: `${body.firstName} ${body.lastName}`,
        employer: body.employer,
        occupation: body.occupation,
      }, ipAddress);

      // === 5a. RECORD STRIPE PROCESSING FEE (fire-and-forget) ===
      const feeCents = Math.round(body.amountCents * 0.029) + 30;
      recordStripeFee(
        stripeChargeId,
        body.amountCents,
        feeCents,
        new Date().toISOString().split('T')[0]
      );

      // === 5b. BEST-EFFORTS EMPLOYER/OCCUPATION FOLLOW-UP (fire-and-forget) ===
      const newAggregateYtdCents = priorAnnualTotalCents + body.amountCents;
      checkAndSendFollowUp(
        donor.id,
        body.email,
        body.firstName,
        newAggregateYtdCents,
        body.employer || null,
        body.occupation || null
      );
    }

    // === 6. SEND RECEIPT EMAIL ===
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await sendDonationReceipt({
      to: body.email,
      firstName: body.firstName,
      amount: `$${(body.amountCents / 100).toFixed(2)}`,
      date: formattedDate,
      frequency: body.frequency,
      stripeChargeId,
    });

    // === 7. RETURN SUCCESS ===
    return NextResponse.json({
      success: true,
      chargeId: stripeChargeId,
      amount: `$${(body.amountCents / 100).toFixed(2)}`,
      frequency: body.frequency,
      warnings: donationValidation.warnings,
    });
  } catch (error) {
    console.error('[Donate] Unhandled error:', error);

    // Stripe-specific errors
    if (error instanceof Error && 'type' in error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stripeError = error as any;
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json(
          { error: stripeError.message || 'Your card was declined.' },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
