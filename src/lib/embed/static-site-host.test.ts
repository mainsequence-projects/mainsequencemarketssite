import { createStaticSiteIframeHost } from "@dev-mainsequence/command-center-sdk/embed";
import { STATIC_SITE_IFRAME_DEFAULT_SANDBOX } from "@dev-mainsequence/command-center-sdk/embed/react";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("Command Center static-site iframe host requirements", () => {
  afterEach(() => vi.useRealTimers());

  it("uses the SDK scripts/forms/same-origin sandbox default", () => {
    expect(STATIC_SITE_IFRAME_DEFAULT_SANDBOX).toBe(
      "allow-forms allow-same-origin allow-scripts",
    );
  });

  it("reports a handshake timeout and cancels it on disposal", () => {
    vi.useFakeTimers();
    const onProtocolError = vi.fn();
    const host = createStaticSiteIframeHost({
      targetOrigin: "https://markets.example.com",
      targetWindow: { postMessage: vi.fn() },
      context: { themeId: "quartz-light", themeMode: "light", userUid: null },
      handshakeTimeoutMs: 500,
      onProtocolError,
    });

    vi.advanceTimersByTime(500);
    expect(onProtocolError).toHaveBeenCalledWith("Static-site iframe handshake timed out.");
    host.dispose();
    vi.advanceTimersByTime(500);
    expect(onProtocolError).toHaveBeenCalledTimes(1);
  });
});
