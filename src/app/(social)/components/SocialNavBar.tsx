"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSocialAuth } from "./SocialAuthProvider";

const navLinks = [
  { label: "Dashboard", href: "/" },
  { label: "Calendar", href: "/calendar" },
  { label: "Generate", href: "/generate" },
  { label: "Queue", href: "/queue" },
];

export default function SocialNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useSocialAuth();

  // Normalize pathname: strip /social prefix for active link matching
  const normalizedPath = pathname.replace(/^\/social/, "") || "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  // Don't show nav on sign-in page
  if (normalizedPath === "/sign-in" || normalizedPath === "/auth/callback") {
    return null;
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: CivicBoom logo & name */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/civicboom-logo-nav.png"
              alt="CivicBoom logo"
              width={30}
              height={24}
              className="h-[54px] w-auto"
            />
            <span className="text-lg font-extrabold text-white">
              CivicBoom
            </span>
          </Link>

          {/* Center: Nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = normalizedPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
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

          {/* Right: User + mobile toggle */}
          <div className="flex items-center gap-2">
            {!loading && user && (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-xs text-gray-400">{displayName}</span>
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
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Toggle navigation"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0B0F1A]/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = normalizedPath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {!loading && user && (
              <div className="border-t border-white/[0.06] mt-2 pt-2">
                <span className="block px-3 py-2 text-xs text-gray-500">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
