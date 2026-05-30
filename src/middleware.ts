import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const url = req.nextUrl;
  const path = url.pathname;
  const authState = req.auth as { discordId?: string; persona?: string } | null;
  const isSignedIn = Boolean(authState?.discordId);
  const persona = authState?.persona ?? "guest";

  // Public paths
  if (path === "/" || path.startsWith("/api") || path.startsWith("/_next") || path.startsWith("/assets")) {
    return NextResponse.next();
  }

  // Not signed in → bounce to "/"
  if (!isSignedIn) {
    return NextResponse.redirect(new URL("/", url));
  }

  // Applicant: only allowed on /apply
  if (persona === "applicant") {
    if (!path.startsWith("/apply")) return NextResponse.redirect(new URL("/apply", url));
    return NextResponse.next();
  }

  // Member: cannot enter /admin
  if (persona === "member" && path.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};
