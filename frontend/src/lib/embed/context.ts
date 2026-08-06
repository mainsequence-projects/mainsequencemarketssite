import {
  createStaticSiteIframeClient,
  type StaticSiteIframeChannel,
  type StaticSiteIframeContext,
} from "@dev-mainsequence/command-center-sdk/embed";

export const MARKETS_EMBED_CHANNEL: StaticSiteIframeChannel = "mainsequence.markets";

export type EmbedContext = StaticSiteIframeContext;

export function connectToCommandCenter(input: {
  parentOrigin: string;
  onContext: (context: EmbedContext) => void;
  onProtocolError?: (message: string) => void;
  browserWindow?: Window;
}): () => void {
  const browserWindow = input.browserWindow ?? window;
  const client = createStaticSiteIframeClient({
    channel: MARKETS_EMBED_CHANNEL,
    hostOrigin: input.parentOrigin,
    parentWindow: browserWindow.parent,
    onContext: input.onContext,
    onProtocolError: input.onProtocolError,
  });
  const handleMessage = (event: MessageEvent<unknown>) => {
    client.handleMessage(event);
  };

  browserWindow.addEventListener("message", handleMessage);
  client.announceReady();

  return () => {
    browserWindow.removeEventListener("message", handleMessage);
    client.dispose();
  };
}
