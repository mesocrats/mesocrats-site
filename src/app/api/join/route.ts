import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/sendgrid";
import { DONATIONS_NOTIFY_SOURCE } from "@/lib/donations";

// Sources this route is allowed to write to contacts.source. Anything else is
// rejected so the column stays queryable.
const ALLOWED_SOURCES = ["join", DONATIONS_NOTIFY_SOURCE];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      first_name,
      lastName,
      last_name,
      email,
      state,
      metadata,
      source,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const resolvedSource = source || "join";
    if (!ALLOWED_SOURCES.includes(resolvedSource)) {
      return NextResponse.json(
        { error: "Invalid source" },
        { status: 400 }
      );
    }

    const resolvedFirstName = firstName || first_name || null;
    const resolvedLastName = lastName || last_name || null;

    const { error: dbError } = await getSupabase().from("contacts").insert({
      email,
      first_name: resolvedFirstName,
      last_name: resolvedLastName,
      state: state || null,
      source: resolvedSource,
      metadata: metadata || null,
    });

    if (dbError) throw dbError;

    if (resolvedSource === DONATIONS_NOTIFY_SOURCE) {
      await Promise.all([
        sendEmail({
          to: "info@mesocrats.org",
          subject: "Donation Reopen Notify Signup",
          html: `
          <h2>Donation Reopen Notify Signup</h2>
          <p><strong>Email:</strong> ${email}</p>
          ${resolvedFirstName ? `<p><strong>First Name:</strong> ${resolvedFirstName}</p>` : ""}
        `,
        }),
        sendEmail({
          to: email,
          subject: "You're on the list",
          html: `
          <h2>You're on the list</h2>
          <p>Thanks for wanting to support the Mesocratic Party.</p>
          <p>We're setting up the party's official organization and bank accounts. As soon as that's done, we'll start accepting donations, and we'll email you the moment we do.</p>
          <p>In the meantime, you can join the party for free at <a href="https://mesocrats.org/involved/join">mesocrats.org/involved/join</a>.</p>
          <p>- The Mesocratic Party</p>
        `,
        }),
      ]);

      return NextResponse.json({ success: true });
    }

    await Promise.all([
      sendEmail({
        to: "info@mesocrats.org",
        subject: "New Member Signup",
        html: `
          <h2>New Member Signup</h2>
          <p><strong>Email:</strong> ${email}</p>
          ${resolvedFirstName ? `<p><strong>First Name:</strong> ${resolvedFirstName}</p>` : ""}
          ${resolvedLastName ? `<p><strong>Last Name:</strong> ${resolvedLastName}</p>` : ""}
          ${state ? `<p><strong>State:</strong> ${state}</p>` : ""}
        `,
      }),
      sendEmail({
        to: email,
        subject: "Welcome to the Mesocratic Party!",
        html: `
          <h2>Welcome to the Mesocratic Party!</h2>
          <p>Thank you for joining. You're now part of a movement to protect the middle class and hold the middle ground that keeps this country together.</p>
          <p>We'll keep you updated on what's happening — from Convention X to local races to new policy positions.</p>
          <p>In the meantime, explore the party at <a href="https://mesocrats.org">mesocrats.org</a>.</p>
          <p>— The Mesocratic Party</p>
        `,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Join API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
