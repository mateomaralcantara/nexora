import { NextResponse } from "next/server";

import {
  getEnvironmentStatus,
} from "@/lib/env-status";

export const runtime = "nodejs";

export async function GET() {
  const environment =
    getEnvironmentStatus();

  return NextResponse.json(
    {
      application:
        "Nexora Realty OS",

      status: "ok",

      version:
        process.env
          .npm_package_version ??
        "unknown",

      environment:
        process.env.NODE_ENV,

      services: environment,

      timestamp:
        new Date().toISOString(),
    },
    {
      status: 200,

      headers: {
        "Cache-Control":
          "no-store, max-age=0",
      },
    },
  );
}