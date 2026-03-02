import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  console.log("MW hostname:", request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.hostname);

  // Check multiple hostname sources -- Vercel may use x-forwarded-host
  const forwardedHost = request.headers.get("x-forwarded-host") || "";
  const hostHeader = request.headers.get("host") || "";
  const nextUrlHost = request.nextUrl.hostname;
  const { pathname } = request.nextUrl;

  console.log("[middleware]", { forwardedHost, hostHeader, nextUrlHost, pathname });

  const isDeveloperSubdomain =
    forwardedHost.startsWith("developer.mesocrats.org") ||
    hostHeader.startsWith("developer.mesocrats.org") ||
    nextUrlHost === "developer.mesocrats.org" ||
    forwardedHost.startsWith("developer.localhost") ||
    hostHeader.startsWith("developer.localhost") ||
    nextUrlHost === "developer.localhost";

  const isSocialSubdomain =
    forwardedHost.startsWith("social.mesocrats.org") ||
    hostHeader.startsWith("social.mesocrats.org") ||
    nextUrlHost === "social.mesocrats.org" ||
    forwardedHost.startsWith("social.localhost") ||
    hostHeader.startsWith("social.localhost") ||
    nextUrlHost === "social.localhost";

  if (isSocialSubdomain) {
    if (pathname.startsWith("/social")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/social${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isDeveloperSubdomain) {
    // Already has /developer prefix -- don't double-prepend
    if (pathname.startsWith("/developer")) {
      return NextResponse.next();
    }

    // API routes live in the (developer) route group at /api/v1/* —
    // don't rewrite them to /developer/api/v1/* or they'll 404.
    if (pathname.startsWith("/api/v1")) {
      return NextResponse.next();
    }

    // Rewrite to /developer/* path
    const url = request.nextUrl.clone();
    url.pathname = `/developer${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Redirect mesocrats.org/developer/* to developer.mesocrats.org/*
  // Skip localhost so local dev keeps working
  const isLocalhost =
    nextUrlHost === "localhost" ||
    hostHeader.startsWith("localhost") ||
    forwardedHost.startsWith("localhost");

  if (!isLocalhost && pathname.startsWith("/social")) {
    const subpath = pathname.replace(/^\/social/, "") || "/";
    const redirectUrl = `https://social.mesocrats.org${subpath}`;
    return NextResponse.redirect(redirectUrl, 301);
  }

  if (!isLocalhost && pathname.startsWith("/developer")) {
    const subpath = pathname.replace(/^\/developer/, "") || "/";
    const redirectUrl = `https://developer.mesocrats.org${subpath}`;
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|developer/favicon|developer/apple-touch-icon|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.json$).*)",
  ],
};
