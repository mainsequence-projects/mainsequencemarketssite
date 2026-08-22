import { describe, expect, it } from "vitest";

import { exactHttpOrigin, loadRuntimeConfiguration, RuntimeConfigurationError } from "@/config/runtime";

describe("runtime configuration", () => {
  const fastApiReleaseUid = "5bfa6756-ed60-46a2-8057-66ec6cb4f814";

  it("accepts and normalizes exact HTTP origins", () => {
    expect(exactHttpOrigin("https://markets.example.com/", "origin")).toBe("https://markets.example.com");
  });

  it.each([
    "*",
    "file:///tmp/api",
    "https://user:secret@markets.example.com",
    "https://markets.example.com/api/v1",
    "https://markets.example.com?debug=1",
  ])("rejects unsafe origins: %s", (value) => {
    expect(() => exactHttpOrigin(value, "origin")).toThrow(RuntimeConfigurationError);
  });

  it("requires a parent allowlist in embedded mode", () => {
    expect(() => loadRuntimeConfiguration({
      embedded: true,
      fastApiReleaseUid,
    })).toThrow(/requires VITE_COMMAND_CENTER_ORIGIN/);
  });

  it("requires the delegated FastAPI release in embedded mode", () => {
    expect(() => loadRuntimeConfiguration({
      commandCenterOrigin: "https://command-center.example.com",
      embedded: true,
    })).toThrow(/requires VITE_FASTAPI_RELEASE_UID/);
  });

  it("uses a release UID instead of a direct API origin in embedded mode", () => {
    expect(loadRuntimeConfiguration({
      commandCenterOrigin: "https://command-center.example.com",
      embedded: true,
      fastApiReleaseUid: fastApiReleaseUid.toUpperCase(),
    })).toEqual({
      apiOrigin: null,
      commandCenterOrigin: "https://command-center.example.com",
      embedded: true,
      fastApiReleaseUid,
    });
  });

  it("allows standalone mode without a parent origin", () => {
    expect(loadRuntimeConfiguration({
      apiBaseUrl: "https://markets.example.com",
      embedded: false,
    })).toEqual({
      apiOrigin: "https://markets.example.com",
      commandCenterOrigin: null,
      embedded: false,
      fastApiReleaseUid: null,
    });
  });
});
