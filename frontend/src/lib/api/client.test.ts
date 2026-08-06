import { describe, expect, it, vi } from "vitest";

import {
  ApiError,
  apiGet,
  resolveApiUrl,
} from "@/lib/api/client";

describe("Markets API client", () => {
  it("resolves only against the configured exact origin", () => {
    expect(resolveApiUrl("/api/v1/asset/", { search: "bond" }, "https://markets.example.com"))
      .toBe("https://markets.example.com/api/v1/asset/?search=bond");
    expect(() => resolveApiUrl("https://evil.example.com", {}, "https://markets.example.com"))
      .toThrow(/absolute paths/);
  });

  it("uses the browser gateway session and does not construct authorization headers", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ count: 0, next: null, previous: null, results: [] }),
      { status: 200, headers: { "content-type": "application/json" } },
    ));
    await apiGet("/api/v1/asset/", undefined, { operationId: "listAssets" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.credentials).toBe("include");
    expect(new Headers(init?.headers).has("authorization")).toBe(false);
  });

  it("surfaces unauthorized requests without putting authentication state on the iframe wire", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://markets.example.com");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(
      JSON.stringify({ detail: "Authentication required" }),
      { status: 401, headers: { "content-type": "application/json" } },
    ));
    await expect(apiGet("/api/v1/account/", undefined, { operationId: "listAccounts" }))
      .rejects.toBeInstanceOf(ApiError);
  });
});
