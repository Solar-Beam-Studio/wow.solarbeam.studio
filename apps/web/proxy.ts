import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Paths that require authentication (without locale prefix)
const protectedPaths = ["/guilds"];

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path (without locale prefix) is protected
  const strippedPath = stripLocale(pathname);
  const isProtected = protectedPaths.some(
    (p) => strippedPath === p || strippedPath.startsWith(`${p}/`)
  );

  if (isProtected) {
    // Check for session cookie (Better Auth with "wow-sync" prefix)
    const secureCookie = request.cookies.get(
      "__Secure-wow-sync.session_token"
    );
    const regularCookie = request.cookies.get("wow-sync.session_token");
    const hasSession = !!(secureCookie?.value || regularCookie?.value);

    if (!hasSession) {
      // Detect locale from the current path for the login redirect
      const locale = routing.locales.find(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
      );
      const loginPath = locale && locale !== routing.defaultLocale
        ? `/${locale}/login`
        : "/login";

      const loginUrl = new URL(loginPath, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Delegate to next-intl for locale detection and routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
