"use client";

import { useState } from "react";

export default function IdeaForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [policyArea, setPolicyArea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/submit-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          policyArea,
          title,
          description,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-bold mb-2">Idea Submitted!</h3>
        <p className="text-primary/60">
          Thank you for contributing to the Mesocratic platform.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="text"
          placeholder="Last Name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <input
        type="email"
        placeholder="Email Address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <select
        required
        value={policyArea}
        onChange={(e) => setPolicyArea(e.target.value)}
        className="w-full border border-primary/20 rounded px-4 py-3 text-sm text-primary/60 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">Policy Area</option>
        <option value="healthcare">Healthcare</option>
        <option value="economy">Economy &amp; Jobs</option>
        <option value="taxes">Tax Reform</option>
        <option value="education">Education</option>
        <option value="infrastructure">Infrastructure</option>
        <option value="immigration">Immigration</option>
        <option value="housing">Housing</option>
        <option value="environment">Climate &amp; Energy</option>
        <option value="other">Other</option>
      </select>
      <input
        type="text"
        placeholder="Idea Title (brief summary)"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <textarea
        placeholder="Describe your policy idea..."
        rows={6}
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent-light text-white font-bold py-3 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "SUBMITTING..." : "SUBMIT IDEA"}
      </button>
    </form>
  );
}
