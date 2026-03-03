"use client";

import { useState } from "react";
import MethodBadge from "../../components/MethodBadge";
import Badge from "../../components/Badge";
import CodeBlock from "../../components/CodeBlock";
import {
  endpoints,
  overviewItems,
  sidebarCategories,
  webhookEvents,
} from "./data";
import type { Endpoint, Parameter } from "./data";

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

function Sidebar({
  activeId,
  onSelect,
  expandedCategories,
  onToggleCategory,
  mobileOpen,
  onCloseMobile,
}: {
  activeId: string;
  onSelect: (id: string) => void;
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (name: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed top-16 z-50 h-[calc(100vh-4rem)] w-60 overflow-y-auto
          bg-[#101529] border-r border-white/[0.06]
          transition-transform duration-200
          lg:sticky lg:translate-x-0 lg:z-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="py-6 px-3">
          {/* Overview group */}
          <div className="mb-6">
            <p className="px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              Overview
            </p>
            {overviewItems.map((item) => (
              <div
                key={item}
                className="px-3 py-1.5 text-sm text-gray-500 cursor-default"
              >
                {item}
              </div>
            ))}
          </div>

          {/* Endpoints group */}
          <div className="mb-6">
            <p className="px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              Endpoints
            </p>
            {sidebarCategories.map((cat) => {
              const isExpanded = expandedCategories[cat.name] !== false;
              return (
                <div key={cat.name} className="mb-1">
                  <button
                    onClick={() => onToggleCategory(cat.name)}
                    className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors rounded"
                  >
                    <span>{cat.name}</span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    >
                      <path d="M4.5 2.5L7.5 6L4.5 9.5" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="ml-2">
                      {cat.endpoints.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => {
                            onSelect(ep.id);
                            onCloseMobile();
                          }}
                          className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded transition-colors ${
                            activeId === ep.id
                              ? "bg-white/[0.06] text-white font-semibold"
                              : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                          }`}
                        >
                          <MethodBadge method={ep.method} />
                          <span className="truncate font-dev-mono text-xs">
                            {ep.path.replace("/v1/", "")}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Events group */}
          <div>
            <p className="px-3 mb-2 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
              Events
            </p>
            {webhookEvents.map((event) => (
              <div
                key={event}
                className="px-3 py-1 text-[11px] font-dev-mono text-gray-500"
              >
                {event}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Parameters table                                                   */
/* ------------------------------------------------------------------ */

function ParametersTable({ parameters }: { parameters: Parameter[] }) {
  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <h3 className="text-sm font-semibold text-white">Parameters</h3>
      </div>
      <div>
        {parameters.map((param, i) => (
          <div
            key={param.name}
            className={`px-4 py-3 flex flex-col gap-1 border-b border-white/[0.06] last:border-b-0 ${
              i % 2 === 1 ? "bg-white/[0.015]" : ""
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-sm font-dev-mono text-white">
                {param.name}
              </code>
              <span className="text-xs text-gray-500">{param.type}</span>
              {param.required && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F06B65] bg-[#EE2C24]/10 px-1.5 py-0.5 rounded">
                  Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {param.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Auth callout                                                       */
/* ------------------------------------------------------------------ */

function AuthCallout() {
  return (
    <div className="rounded-lg border border-[#4374BA]/30 bg-[#4374BA]/5 p-4 mb-8">
      <div className="flex items-start gap-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4374BA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 shrink-0"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            Authentication
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            All API requests require authentication via Bearer token. Include
            your API key in the Authorization header.
          </p>
          <div className="mt-3 rounded bg-[#0D0D1A] border border-white/[0.06] px-3 py-2">
            <code className="text-xs font-dev-mono text-gray-300">
              Authorization: Bearer mce_live_...
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Endpoint detail (center column)                                    */
/* ------------------------------------------------------------------ */

function EndpointDetail({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <MethodBadge method={endpoint.method} />
          <code className="text-base font-dev-mono text-white">
            {endpoint.path}
          </code>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          {endpoint.title}
        </h1>
        <p className="text-sm text-gray-400">{endpoint.auth}</p>
      </div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-sm text-gray-300 leading-relaxed">
          {endpoint.description}
        </p>
      </div>

      {/* Parameters */}
      {endpoint.parameters.length > 0 && (
        <ParametersTable parameters={endpoint.parameters} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Request / response (right column)                                  */
/* ------------------------------------------------------------------ */

function EndpointExamples({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div className="space-y-6">
      {/* Request */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Request</h3>
        <CodeBlock
          code={endpoint.requestExample}
          language="bash"
          title="cURL"
        />
      </div>

      {/* Response */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-white">Response</h3>
          <Badge text="200 OK" variant="green" />
        </div>
        <CodeBlock
          code={endpoint.responseExample}
          language="json"
          title="JSON"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ApiReferencePage() {
  const [activeId, setActiveId] = useState("list-contributions");
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    System: true,
    Committees: true,
    Contributors: true,
    Contributions: true,
    Disbursements: true,
    Compliance: true,
    Reports: true,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeEndpoint: Endpoint = endpoints[activeId];

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [name]: prev[name] === false,
    }));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-6 left-6 z-30 lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#12121F] border border-white/[0.06] text-sm text-gray-300 shadow-lg"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        Endpoints
      </button>

      {/* Sidebar */}
      <Sidebar
        activeId={activeId}
        onSelect={setActiveId}
        expandedCategories={expandedCategories}
        onToggleCategory={toggleCategory}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Center column */}
        <div className="flex-1 min-w-0 px-6 py-10 lg:px-8 lg:py-10 bg-[#101529]">
          <AuthCallout />
          <EndpointDetail endpoint={activeEndpoint} />
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 px-6 py-10 lg:px-8 lg:py-10 bg-black/30 border-t lg:border-t-0 lg:border-l border-white/[0.06]">
          <EndpointExamples endpoint={activeEndpoint} />
        </div>
      </div>
    </div>
  );
}
