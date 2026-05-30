import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasAuthCookie(req: NextRequest) {
  return (
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token")
  );
}

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Public paths
  if (path === "/" || path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/assets")) {
    return NextResponse.next();
  }

  if (!hasAuthCookie(req)) {
    return NextResponse.redirect(new URL("/", url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};
