"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface NavChild {
  label: string;
  href: string;
  external?: boolean;
}

interface NavItemWithChildren {
  label: string;
  href?: undefined;
  children: NavChild[];
}

interface NavItemDirect {
  label: string;
  href: string;
  children?: undefined;
}

type NavItem = NavItemWithChildren | NavItemDirect;

const navItems: NavItem[] = [
  {
    label: "About",
    children: [
      { label: "Our Idea", href: "/about/idea" },
      { label: "Our Story", href: "/about/story" },
      { label: "Leadership", href: "/about/leadership" },
      { label: "FAQ", href: "/about/faq" },
    ],
  },
  {
    label: "Party",
    children: [
      { label: "Declaration", href: "/party/declaration" },
      { label: "Our Mission", href: "/party/mission" },
      { label: "Our Politics", href: "/party/politics" },
    ],
  },
  {
    label: "Platform",
    children: [
      { label: "Overview", href: "/platform" },
      { label: "How It Works", href: "/platform/how-it-works" },
      { label: "Policy Positions", href: "/platform/policies" },
      { label: "PartyStack", href: "https://developer.mesocrats.org", external: true },
    ],
  },
  {
    label: "CCX",
    children: [
      { label: "What To Know", href: "/ccx" },
      { label: "Permanent Panels", href: "/ccx/permanent-panels" },
      { label: "Participation", href: "/ccx/register" },
      { label: "Submit Ideas", href: "/ccx/ideas" },
    ],
  },
  {
    label: "Get Involved",
    children: [
      { label: "Join", href: "/involved/join" },
      { label: "Volunteer", href: "/involved/volunteer" },
      { label: "Run for Office", href: "/candidates/run" },
    ],
  },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
  { label: "Donate", href: "/donate" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (label: string) => {
    setOpenAccordion(openAccordion === label ? null : label);
  };

  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / site name */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/mp-logo-m.png"
              alt="Mesocratic Party logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <span className="hidden sm:inline text-xl font-bold tracking-tight">
              The Mesocratic Party
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:text-accent-light transition-colors">
                    {item.label}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute left-0 top-full pt-1">
                      <div className="bg-white text-primary rounded-md shadow-lg ring-1 ring-black/5 min-w-[200px] py-1">
                        {item.children.map((child) =>
                          child.external ? (
                            <a
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-1.5 px-4 py-2.5 text-sm hover:bg-gray-light transition-colors"
                            >
                              {child.label}
                              <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-sm hover:bg-gray-light transition-colors"
                            >
                              {child.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : item.label === "Donate" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="border border-white/20 bg-transparent text-white text-sm font-medium px-4 py-2 rounded ml-2 transition-all duration-200 hover:bg-[#FDD023] hover:border-[#FDD023] hover:text-[#1A1A2E]"
                >
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium hover:text-accent-light transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => {
              setMobileOpen(!mobileOpen);
              if (mobileOpen) setOpenAccordion(null);
            }}
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-white/10 px-4 pb-4">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="border-b border-white/5">
                <button
                  className="flex items-center justify-between w-full px-2 py-3 text-sm font-medium hover:text-accent-light transition-colors"
                  onClick={() => toggleAccordion(item.label)}
                >
                  {item.label}
                  <svg
                    className={`w-4 h-4 transition-transform ${openAccordion === item.label ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openAccordion === item.label && (
                  <div className="pb-2 pl-4">
                    {item.children.map((child) =>
                      child.external ? (
                        <a
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-1.5 px-2 py-2 text-sm text-white/70 hover:text-accent-light transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                          <svg className="w-3 h-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-2 py-2 text-sm text-white/70 hover:text-accent-light transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : item.label === "Donate" ? (
              <Link
                key={item.href}
                href={item.href}
                className="block border border-white/20 bg-transparent text-white text-sm font-medium rounded mt-3 py-2.5 text-center transition-all duration-200 hover:bg-[#FDD023] hover:border-[#FDD023] hover:text-[#1A1A2E]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-3 text-sm font-medium border-b border-white/5 hover:text-accent-light transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
