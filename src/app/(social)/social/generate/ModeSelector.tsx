"use client";

import { useState } from "react";

// --- Types ---

export type PlatformChoice = "linkedin" | "twitter_policy" | "twitter_today";
export type ScopeChoice = "full" | "single";

export interface ModeSelection {
  platform: PlatformChoice;
  scope: ScopeChoice;
  /** For single-post: the target date (ISO string, date only) */
  singleDate?: string;
  /** For twitter_today single: the time slot index (0=10am, 1=1pm, 2=4pm EST) */
  singleTimeSlot?: number;
}

// --- Constants ---

const PLATFORMS: {
  value: PlatformChoice;
  label: string;
  description: string;
  fullLabel: string;
  fullDesc: string;
  singleLabel: string;
  singleDesc: string;
}[] = [
  {
    value: "linkedin",
    label: "LinkedIn",
    description: "Professional content for the MNC page",
    fullLabel: "Full Week",
    fullDesc: "Posts for remaining weekdays (skip past days)",
    singleLabel: "Today Only",
    singleDesc: "1 post, pick the day",
  },
  {
    value: "twitter_policy",
    label: "Twitter \u2014 Policy",
    description: "Morning policy tweets",
    fullLabel: "Full Week",
    fullDesc: "Policy tweets for remaining weekdays",
    singleLabel: "Today Only",
    singleDesc: "1 tweet, pick the day",
  },
  {
    value: "twitter_today",
    label: "Twitter \u2014 Today's Tweets",
    description: "Respond to today's news",
    fullLabel: "Full Day",
    fullDesc: "3 tweets for today (10am, 1pm, 4pm EST)",
    singleLabel: "Single Tweet",
    singleDesc: "1 tweet, pick the time slot",
  },
];

const TIME_SLOTS = [
  { label: "10:00 AM EST", hour: 15 },
  { label: "1:00 PM EST", hour: 18 },
  { label: "4:00 PM EST", hour: 21 },
];

// --- Helpers ---

function getNextWeekday(minDate: Date): string {
  const d = new Date(minDate);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
}

function getTodayEST(): Date {
  // Get current time in EST
  const now = new Date();
  const estOffset = -5;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcMs + estOffset * 3600000);
}

function formatDateForInput(): string {
  const est = getTodayEST();
  return est.toISOString().split("T")[0];
}

// --- Component ---

interface ModeSelectorProps {
  value: ModeSelection;
  onChange: (sel: ModeSelection) => void;
  disabled?: boolean;
}

export default function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  const [expanded, setExpanded] = useState<PlatformChoice>(value.platform);

  function selectPlatform(p: PlatformChoice) {
    setExpanded(p);
    const defaults: ModeSelection = {
      platform: p,
      scope: "full",
    };
    onChange(defaults);
  }

  function selectScope(scope: ScopeChoice) {
    const updated: ModeSelection = { ...value, scope };
    if (scope === "single") {
      if (value.platform === "twitter_today") {
        updated.singleTimeSlot = 0;
        delete updated.singleDate;
      } else {
        const tomorrow = getTodayEST();
        tomorrow.setDate(tomorrow.getDate() + 1);
        updated.singleDate = getNextWeekday(tomorrow);
        delete updated.singleTimeSlot;
      }
    } else {
      delete updated.singleDate;
      delete updated.singleTimeSlot;
    }
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {PLATFORMS.map((p) => {
        const isActive = expanded === p.value;
        const isSelected = value.platform === p.value;

        return (
          <div
            key={p.value}
            className={`rounded-xl border transition-colors ${
              isSelected
                ? "border-[#6C3393]/50 bg-[#6C3393]/5"
                : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            {/* Platform header */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => selectPlatform(p.value)}
              className="w-full text-left p-4 flex items-center justify-between disabled:opacity-50"
            >
              <div>
                <p className="text-sm font-medium text-white">{p.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
              </div>
              {isSelected && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C3393]" />
              )}
            </button>

            {/* Scope options */}
            {isActive && isSelected && (
              <div className="px-4 pb-4 space-y-2">
                <div className="border-t border-white/[0.06] pt-3 space-y-2">
                  {/* Full option */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      value.scope === "full"
                        ? "border-[#4374BA]/40 bg-[#4374BA]/5"
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`scope-${p.value}`}
                      checked={value.scope === "full"}
                      onChange={() => selectScope("full")}
                      disabled={disabled}
                      className="mt-0.5 accent-[#4374BA]"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{p.fullLabel}</p>
                      <p className="text-xs text-gray-400">{p.fullDesc}</p>
                    </div>
                  </label>

                  {/* Single option */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      value.scope === "single"
                        ? "border-[#4374BA]/40 bg-[#4374BA]/5"
                        : "border-white/[0.06] hover:border-white/[0.12]"
                    } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`scope-${p.value}`}
                      checked={value.scope === "single"}
                      onChange={() => selectScope("single")}
                      disabled={disabled}
                      className="mt-0.5 accent-[#4374BA]"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{p.singleLabel}</p>
                      <p className="text-xs text-gray-400">{p.singleDesc}</p>
                    </div>
                  </label>
                </div>

                {/* Date/time picker for single mode */}
                {value.scope === "single" && (
                  <div className="pl-8 pt-1">
                    {p.value === "twitter_today" ? (
                      <div className="flex gap-2">
                        {TIME_SLOTS.map((slot, idx) => (
                          <button
                            key={idx}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              onChange({ ...value, singleTimeSlot: idx })
                            }
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                              value.singleTimeSlot === idx
                                ? "border-[#4374BA]/50 bg-[#4374BA]/10 text-white"
                                : "border-white/[0.08] text-gray-400 hover:text-white hover:border-white/[0.15]"
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={value.singleDate || formatDateForInput()}
                        min={formatDateForInput()}
                        onChange={(e) => {
                          const d = new Date(e.target.value + "T12:00:00");
                          // Skip weekends
                          if (d.getDay() === 0 || d.getDay() === 6) return;
                          onChange({ ...value, singleDate: e.target.value });
                        }}
                        disabled={disabled}
                        className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#4374BA]/50 [color-scheme:dark]"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Exported helpers for use by the generate page ---

export { TIME_SLOTS };

/**
 * Get remaining weekdays from today in EST. If current EST hour >= 9 (i.e. 14 UTC), skip today.
 * Returns ISO date strings (YYYY-MM-DD).
 */
export function getRemainingWeekdays(): string[] {
  const now = new Date();
  const estHour = (now.getUTCHours() - 5 + 24) % 24;
  const estNow = getTodayEST();
  const todayStr = estNow.toISOString().split("T")[0];

  const days: string[] = [];
  // Start from today (or tomorrow if past 9am EST)
  const start = new Date(estNow);
  if (estHour >= 9) {
    start.setDate(start.getDate() + 1);
  }

  // Find remaining weekdays this week (Mon-Fri)
  // Get this week's Monday
  const monday = new Date(estNow);
  const dow = estNow.getDay();
  monday.setDate(estNow.getDate() - (dow === 0 ? 6 : dow - 1));

  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = d.toISOString().split("T")[0];
    if (dStr >= (estHour >= 9 ? start.toISOString().split("T")[0] : todayStr)) {
      days.push(dStr);
    }
  }

  // If no days left this week, use next week
  if (days.length === 0) {
    const nextMon = new Date(monday);
    nextMon.setDate(nextMon.getDate() + 7);
    for (let i = 0; i < 5; i++) {
      const d = new Date(nextMon);
      d.setDate(nextMon.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
  }

  return days;
}

/**
 * Compute the scheduled ISO timestamp for a post given the mode and target date/slot.
 */
export function computeScheduledAt(
  platform: PlatformChoice,
  scope: ScopeChoice,
  targetDate: string,
  index: number,
  timeSlot?: number
): string {
  const [y, m, d] = targetDate.split("-").map(Number);

  let hourUTC: number;
  if (platform === "twitter_today") {
    const slotIdx = scope === "single" ? (timeSlot ?? 0) : index;
    hourUTC = TIME_SLOTS[slotIdx]?.hour ?? 12;
  } else if (platform === "twitter_policy") {
    hourUTC = 12; // 7 AM EST
  } else {
    hourUTC = 14; // 9 AM EST
  }

  return new Date(Date.UTC(y, m - 1, d, hourUTC, 0, 0)).toISOString();
}

export function formatTimeEST(isoString: string): string {
  const d = new Date(isoString);
  const estHour = (d.getUTCHours() - 5 + 24) % 24;
  const ampm = estHour >= 12 ? "PM" : "AM";
  const displayHour = estHour === 0 ? 12 : estHour > 12 ? estHour - 12 : estHour;
  return `${displayHour}:00 ${ampm} EST`;
}

export function getAPIPlatform(platform: PlatformChoice): string {
  return platform === "linkedin" ? "linkedin" : "twitter";
}

export function getAPIType(platform: PlatformChoice): string | undefined {
  if (platform === "twitter_policy") return "policy_morning";
  if (platform === "twitter_today") return "current_events";
  return undefined;
}
