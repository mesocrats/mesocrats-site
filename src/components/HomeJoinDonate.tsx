"use client";

import { useState } from "react";
import { DONATIONS_PAUSED } from "@/lib/donations";

export default function HomeJoinDonate() {
  const [joinEmail, setJoinEmail] = useState("");
  const [joinFirstName, setJoinFirstName] = useState("");
  const [joinZip, setJoinZip] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [joinError, setJoinError] = useState("");


  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: joinEmail,
          firstName: joinFirstName || undefined,
          metadata: joinZip ? { zipCode: joinZip } : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setJoinSuccess(true);
    } catch (err) {
      setJoinError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setJoinLoading(false);
    }
  }


  return (
    <section
      className={
        DONATIONS_PAUSED ? "bg-white" : "grid grid-cols-1 lg:grid-cols-2"
      }
    >
      {/* Join side */}
      <div className="bg-white py-16 px-6 sm:px-10 lg:px-16">
        <div
          className={
            DONATIONS_PAUSED
              ? "max-w-lg mx-auto"
              : "max-w-md mx-auto lg:mx-0 lg:ml-auto"
          }
        >
          <h2 className="text-3xl font-bold mb-3">
            This Is Your Party. Come Build It.
          </h2>
          <p className="text-primary/60 mb-8">
            Membership is free. It takes 30 seconds. And it means you&apos;re
            part of what comes next.
          </p>
          {joinSuccess ? (
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold mb-2">You&apos;re In!</h3>
              <p className="text-primary/60">
                Welcome to the Mesocratic Party.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleJoin}>
              <input
                type="text"
                placeholder="First Name"
                value={joinFirstName}
                onChange={(e) => setJoinFirstName(e.target.value)}
                className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={joinEmail}
                onChange={(e) => setJoinEmail(e.target.value)}
                className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                placeholder="Zip Code"
                value={joinZip}
                onChange={(e) => setJoinZip(e.target.value)}
                className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {joinError && (
                <p className="text-red-600 text-sm">{joinError}</p>
              )}
              <button
                type="submit"
                disabled={joinLoading}
                className="w-full bg-transparent border border-[#1A1A2E] text-[#1A1A2E] font-bold py-3 rounded transition-all duration-200 hover:bg-[#6C3393] hover:border-[#6C3393] hover:text-white disabled:opacity-50"
              >
                {joinLoading ? "SUBMITTING..." : "I'M IN"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Donate side - hidden while donations are paused */}
      {!DONATIONS_PAUSED && (
      <div className="bg-primary text-white py-16 px-6 sm:px-10 lg:px-16">
        <div className="max-w-md mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold mb-3">Fund the Middle Ground.</h2>
          <p className="text-white/70 mb-8">
            Every dollar goes directly to building this party and getting
            Mesocrats on ballots across America. All contributions are processed
            securely via Stripe and reported to the FEC.
          </p>
          <a
            href="/donate"
            className="inline-block w-full text-center border-2 border-white text-white bg-transparent font-bold py-4 rounded transition-all duration-200 hover:bg-[#FDD023] hover:border-[#FDD023] hover:text-[#1A1A2E] text-lg"
          >
            DONATE NOW
          </a>
          <p className="text-xs text-white/40 mt-6 leading-relaxed">
            Paid for by the Mesocratic National Committee. Not authorized by any
            candidate or candidate&apos;s committee. Contributions or gifts to
            the Mesocratic National Committee are not tax deductible.
          </p>
        </div>
      </div>
      )}
    </section>
  );
}
