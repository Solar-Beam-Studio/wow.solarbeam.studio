import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (Better Auth with "wow-sync" prefix)
  const secureCookie = request.cookies.get(
    "__Secure-wow-sync.session_token"
  );
  const regularCookie = request.cookies.get("wow-sync.session_token");
  const hasSession = !!(secureCookie?.value || regularCookie?.value);

  // Redirect unauthenticated users to login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/guilds/:path*"],
};
