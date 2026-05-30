import { auth } from "@/lib/auth";

export default auth((req) => {
  // Public for now — flip to enforce auth when ready:
  // if (!req.auth) return Response.redirect(new URL("/api/auth/signin", req.url));
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
