import { describe, expect, it } from "vitest";

import { exactHttpOrigin, loadRuntimeConfiguration, RuntimeConfigurationError } from "@/config/runtime";

describe("runtime configuration", () => {
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
      apiBaseUrl: "https://markets.example.com",
      embedded: true,
    })).toThrow(/requires VITE_COMMAND_CENTER_ORIGIN/);
  });

  it("allows standalone mode without a parent origin", () => {
    expect(loadRuntimeConfiguration({
      apiBaseUrl: "https://markets.example.com",
      embedded: false,
    })).toEqual({
      apiOrigin: "https://markets.example.com",
      commandCenterOrigin: null,
      embedded: false,
    });
  });
});
