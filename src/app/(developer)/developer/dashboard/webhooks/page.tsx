"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";
import {
  listWebhookEndpoints,
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  toggleWebhookEndpoint,
  type WebhookEndpoint,
} from "./actions";

const LIVE_EVENTS = [
  {
    name: "contribution.created",
    description: "Fired when a new contribution is recorded",
  },
  {
    name: "contribution.limit_reached",
    description:
      "Fired when a contributor is within $100 of the FEC individual limit",
  },
];

const PLANNED_EVENTS = [
  {
    name: "disbursement.created",
    description: "Fired when a new disbursement is recorded",
  },
  {
    name: "aggregate.threshold_crossed",
    description:
      "Fired when a contributor's YTD aggregate crosses the $200 itemization threshold",
  },
  {
    name: "report.generated",
    description: "Fired when a FEC report's .fec file is generated",
  },
  {
    name: "compliance.deadline_approaching",
    description: "Fired 7 days before a filing deadline",
  },
];

export default function WebhooksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [endpointsLoading, setEndpointsLoading] = useState(true);
  const [committeeId, setCommitteeId] = useState<string | null>(null);

  // Add form state
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [urlError, setUrlError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<WebhookEndpoint | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // Toggling state
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  const fetchEndpoints = useCallback(async () => {
    const result = await listWebhookEndpoints();
    if (result.endpoints) setEndpoints(result.endpoints);
    setCommitteeId(result.committeeId ?? null);
    setEndpointsLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) fetchEndpoints();
  }, [user, fetchEndpoints]);

  function validateUrl(url: string): boolean {
    if (!url.startsWith("https://")) {
      setUrlError("URL must start with https://");
      return false;
    }
    try {
      new URL(url);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Invalid URL format");
      return false;
    }
  }

  const handleCreate = async () => {
    const trimmedUrl = newUrl.trim();
    if (!validateUrl(trimmedUrl)) return;

    setCreating(true);
    setCreateError("");

    const result = await createWebhookEndpoint(trimmedUrl, newDesc.trim());
    setCreating(false);

    if (result.error) {
      setCreateError(result.error);
      return;
    }

    setNewUrl("");
    setNewDesc("");
    setUrlError("");
    fetchEndpoints();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteWebhookEndpoint(deleteTarget.id);
    setDeleting(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setDeleteTarget(null);
    fetchEndpoints();
  };

  const handleToggle = async (endpoint: WebhookEndpoint) => {
    setToggling((prev) => new Set(prev).add(endpoint.id));

    const result = await toggleWebhookEndpoint(endpoint.id, !endpoint.active);

    setToggling((prev) => {
      const next = new Set(prev);
      next.delete(endpoint.id);
      return next;
    });

    if (result.error) {
      alert(result.error);
      return;
    }

    fetchEndpoints();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with back link */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <span className="text-gray-600">/</span>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
        </div>

        {!committeeId && !endpointsLoading && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
            <p className="text-sm text-amber-400">
              No committee bound to your API key. Create a committee via the API
              first to manage webhooks.
            </p>
          </div>
        )}

        {/* SECTION 1 — Registered Endpoints */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">
            Registered Endpoints
          </h2>

          {endpointsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : endpoints.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-12 text-center">
              <p className="text-gray-400">
                No webhook endpoints registered yet.
              </p>
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left px-6 py-3 text-gray-400 font-medium">
                        URL
                      </th>
                      <th className="text-left px-6 py-3 text-gray-400 font-medium">
                        Description
                      </th>
                      <th className="text-left px-6 py-3 text-gray-400 font-medium">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-gray-400 font-medium">
                        Created
                      </th>
                      <th className="text-right px-6 py-3 text-gray-400 font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoints.map((ep) => (
                      <tr
                        key={ep.id}
                        className="border-b border-white/[0.04] last:border-0"
                      >
                        <td className="px-6 py-4 text-white font-mono text-xs max-w-[300px] truncate">
                          {ep.url}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {ep.description || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {ep.active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(ep.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleToggle(ep)}
                              disabled={toggling.has(ep.id)}
                              className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                              {toggling.has(ep.id)
                                ? "..."
                                : ep.active
                                  ? "Disable"
                                  : "Enable"}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(ep)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2 — Add New Endpoint */}
        {committeeId && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">
              Add New Endpoint
            </h2>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => {
                      setNewUrl(e.target.value);
                      if (urlError) setUrlError("");
                    }}
                    placeholder="https://your-server.com/webhooks"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4374BA]/50 focus:ring-1 focus:ring-[#4374BA]/50 font-mono"
                  />
                  {urlError && (
                    <p className="text-xs text-red-400 mt-1">{urlError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g., Production webhook handler"
                    className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#4374BA]/50 focus:ring-1 focus:ring-[#4374BA]/50"
                  />
                </div>

                {createError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {createError}
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={!newUrl.trim() || creating}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#4374BA] hover:bg-[#4374BA]/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Adding..." : "Add Endpoint"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 — Event Reference */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">
            Webhook Events
          </h2>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Live events */}
            <div className="px-6 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                Live
              </span>
            </div>
            {LIVE_EVENTS.map((evt, i) => (
              <div
                key={evt.name}
                className={`px-6 py-4 flex items-start gap-4 ${
                  i < LIVE_EVENTS.length - 1
                    ? "border-b border-white/[0.04]"
                    : ""
                }`}
              >
                <code className="text-sm text-[#4374BA] font-mono shrink-0">
                  {evt.name}
                </code>
                <p className="text-sm text-gray-400">{evt.description}</p>
              </div>
            ))}

            {/* Planned events */}
            <div className="px-6 py-3 border-t border-white/[0.06] border-b border-white/[0.06]">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Planned
              </span>
            </div>
            {PLANNED_EVENTS.map((evt, i) => (
              <div
                key={evt.name}
                className={`px-6 py-4 flex items-start gap-4 opacity-50 ${
                  i < PLANNED_EVENTS.length - 1
                    ? "border-b border-white/[0.04]"
                    : ""
                }`}
              >
                <code className="text-sm text-gray-500 font-mono shrink-0">
                  {evt.name}
                </code>
                <p className="text-sm text-gray-500">{evt.description}</p>
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-gray-500 border border-white/[0.06]">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#12121f] border border-white/[0.08] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">
              Delete Endpoint
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Are you sure you want to delete this webhook endpoint?
            </p>
            <p className="text-xs text-gray-500 font-mono break-all mb-6">
              {deleteTarget.url}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
