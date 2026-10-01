import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getEnvironmentStatus,
} from "../src/lib/env-status";

describe(
  "Nexora environment",
  () => {
    it(
      "returns all expected service flags",
      () => {
        const status =
          getEnvironmentStatus();

        expect(
          typeof status.supabase,
        ).toBe("boolean");

        expect(
          typeof status.supabaseAdmin,
        ).toBe("boolean");

        expect(
          typeof status.openai,
        ).toBe("boolean");

        expect(
          typeof status.whatsapp,
        ).toBe("boolean");

        expect(
          typeof status.email,
        ).toBe("boolean");
      },
    );
  },
);