import { STATIC_SITE_IFRAME_PROTOCOL_VERSION } from "@dev-mainsequence/command-center-sdk/embed";
import { describe, expect, it, vi } from "vitest";

import {
  MARKETS_EMBED_CHANNEL,
  connectToCommandCenter,
} from "@/lib/embed/context";

function createBrowserWindow() {
  let messageHandler: ((event: MessageEvent<unknown>) => void) | undefined;
  const parent = { postMessage: vi.fn() };
  const removeEventListener = vi.fn();
  const browserWindow = {
    parent,
    addEventListener: vi.fn((_type: string, handler: EventListener) => {
      messageHandler = handler as (event: MessageEvent<unknown>) => void;
    }),
    removeEventListener,
  } as unknown as Window;
  return {
    browserWindow,
    parent,
    removeEventListener,
    dispatch: (event: MessageEvent<unknown>) => messageHandler?.(event),
  };
}

function initializeMessage(input: {
  theme?: "dark" | "light";
  themeId?: string;
  userUid?: string | null;
  version?: number;
} = {}) {
  const userUid = input.userUid === undefined ? "user-1" : input.userUid;
  return {
    channel: MARKETS_EMBED_CHANNEL,
    version: input.version ?? STATIC_SITE_IFRAME_PROTOCOL_VERSION,
    type: "initialize",
    payload: {
      theme: input.theme ?? "light",
      themeId: input.themeId ?? "quartz-light",
      user: userUid === null ? null : { id: userUid, uid: userUid, user_uid: userUid },
    },
  };
}

describe("Command Center static-site iframe client", () => {
  it("announces readiness and accepts normalized context from the exact parent", () => {
    const harness = createBrowserWindow();
    const onContext = vi.fn();
    connectToCommandCenter({
      parentOrigin: "https://command-center.example.com",
      browserWindow: harness.browserWindow,
      onContext,
    });

    expect(harness.parent.postMessage).toHaveBeenCalledWith({
      channel: MARKETS_EMBED_CHANNEL,
      version: STATIC_SITE_IFRAME_PROTOCOL_VERSION,
      type: "ready",
      payload: {},
    }, "https://command-center.example.com");

    harness.dispatch({
      source: harness.parent,
      origin: "https://command-center.example.com",
      data: initializeMessage(),
    } as unknown as MessageEvent<unknown>);
    expect(onContext).toHaveBeenCalledWith({
      themeMode: "light",
      themeId: "quartz-light",
      userUid: "user-1",
    });
  });

  it("ignores the wrong source and origin and reports malformed protocol payloads", () => {
    const harness = createBrowserWindow();
    const onContext = vi.fn();
    const onProtocolError = vi.fn();
    connectToCommandCenter({
      parentOrigin: "https://command-center.example.com",
      browserWindow: harness.browserWindow,
      onContext,
      onProtocolError,
    });

    harness.dispatch({
      source: harness.parent,
      origin: "https://other.example.com",
      data: initializeMessage(),
    } as unknown as MessageEvent<unknown>);
    harness.dispatch({
      source: {},
      origin: "https://command-center.example.com",
      data: initializeMessage(),
    } as unknown as MessageEvent<unknown>);
    for (const data of [
      initializeMessage({ version: 2 }),
      { ...initializeMessage(), channel: "mainsequence.other-app" },
      { ...initializeMessage(), payload: { theme: "system", themeId: "quartz-light", user: null } },
    ]) {
      harness.dispatch({
        source: harness.parent,
        origin: "https://command-center.example.com",
        data,
      } as unknown as MessageEvent<unknown>);
    }

    expect(onContext).not.toHaveBeenCalled();
    expect(onProtocolError).toHaveBeenCalledTimes(3);
    expect(onProtocolError).toHaveBeenLastCalledWith(
      "Rejected malformed static-site iframe message.",
    );
  });

  it("applies repeated and anonymous context updates and tears down the listener", () => {
    const harness = createBrowserWindow();
    const onContext = vi.fn();
    const connection = connectToCommandCenter({
      parentOrigin: "https://command-center.example.com",
      browserWindow: harness.browserWindow,
      onContext,
    });

    for (const message of [
      initializeMessage({ theme: "dark", themeId: "main-sequence-space" }),
      initializeMessage({ theme: "light", themeId: "quartz-light", userUid: null }),
    ]) {
      harness.dispatch({
        source: harness.parent,
        origin: "https://command-center.example.com",
        data: message,
      } as unknown as MessageEvent<unknown>);
    }
    connection.disconnect();

    expect(onContext).toHaveBeenCalledTimes(2);
    expect(onContext).toHaveBeenLastCalledWith({
      themeMode: "light",
      themeId: "quartz-light",
      userUid: null,
    });
    expect(harness.removeEventListener).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("rejects initialize messages that exceed the SDK payload limit", () => {
    const harness = createBrowserWindow();
    const onContext = vi.fn();
    const onProtocolError = vi.fn();
    connectToCommandCenter({
      parentOrigin: "https://command-center.example.com",
      browserWindow: harness.browserWindow,
      onContext,
      onProtocolError,
    });

    harness.dispatch({
      source: harness.parent,
      origin: "https://command-center.example.com",
      data: initializeMessage({ themeId: "x".repeat(65_000) }),
    } as unknown as MessageEvent<unknown>);

    expect(onContext).not.toHaveBeenCalled();
    expect(onProtocolError).toHaveBeenCalledWith(
      "Static-site iframe payload exceeds the configured limit.",
    );
  });
});
