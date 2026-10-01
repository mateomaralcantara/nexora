import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(
  request: NextRequest,
) {
  const response =
    await updateSession(request);

  /*
   * Baseline security headers.
   */

  response.headers.set(
    "X-Content-Type-Options",
    "nosniff",
  );

  response.headers.set(
    "X-Frame-Options",
    "SAMEORIGIN",
  );

  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );

  response.headers.set(
    "Permissions-Policy",
    [
      "camera=(self)",
      "microphone=(self)",
      "geolocation=(self)",
    ].join(", "),
  );

  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin",
  );

  response.headers.set(
    "Cross-Origin-Resource-Policy",
    "same-origin",
  );

  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};