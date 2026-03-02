"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";

const navLinks = [
  { label: "Products", href: "/products" },
  { label: "API Reference", href: "/api-reference" },
  { label: "Prompt Library", href: "/prompt-library" },
  { label: "Sandbox", href: "/sandbox" },
  { label: "SDKs", href: "/sdks" },
  { label: "White Papers", href: "/white-papers" },
  { label: "Community", href: "/community" },
];

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function DevNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/sign-in");
  };

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#0A0A15]/80 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-[#0A0A15]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: PartyStack logo & name */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/partystack-logo-nav.png"
              alt="PartyStack logo"
              width={30}
              height={24}
              className="h-6 w-auto"
            />
            <span className="text-lg font-extrabold text-white">
              PartyStack
            </span>
          </Link>

          {/* Center: Nav links (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Mesocrats logo + auth + mobile toggle */}
          <div className="flex items-center gap-1">
            <a
              href="https://mesocrats.org"
              aria-label="mesocrats.org"
              title="mesocrats.org"
              className="hidden lg:flex text-gray-400 hover:text-white transition-colors p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/mp-logo-m.png"
                alt="Mesocratic Party"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
            </a>

            {/* Auth UI */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center p-1 rounded-full hover:ring-2 hover:ring-white/20 transition-all"
                      aria-label="User menu"
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#4374BA]/20 border border-[#4374BA]/30 flex items-center justify-center text-xs font-bold text-[#4374BA]">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#12121f] border border-white/[0.08] rounded-xl shadow-xl py-1 z-50">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard#api-keys"
                          className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          API Keys
                        </Link>
                        <div className="border-t border-white/[0.06] my-1" />
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="hidden lg:inline-flex px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-[#6C3393]/50 hover:bg-[#6C3393]/10 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#0A0A15]/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-white/[0.06] mt-3 pt-3">
              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  className="block px-3 py-2.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Sign In
                </Link>
              )}
              <a
                href="https://mesocrats.org"
                className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/mp-logo-m.png"
                  alt="Mesocratic Party"
                  width={20}
                  height={20}
                  className="h-5 w-auto"
                />
                mesocrats.org
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
