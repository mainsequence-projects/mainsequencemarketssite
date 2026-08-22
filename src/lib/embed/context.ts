import {
  createStaticSiteIframeClient,
  type StaticSiteFastApiTransportState,
  type StaticSiteIframeChannel,
  type StaticSiteIframeClient,
  type StaticSiteIframeContext,
} from "@dev-mainsequence/command-center-sdk/embed";

export const MARKETS_EMBED_CHANNEL: StaticSiteIframeChannel = "mainsequence.markets";

export type EmbedContext = StaticSiteIframeContext;

export type CommandCenterConnection = {
  disconnect: () => void;
  fetchFastApi: StaticSiteIframeClient["fetchFastApi"];
  getFastApiState: StaticSiteIframeClient["getFastApiState"];
};

let activeConnection: CommandCenterConnection | null = null;

export function connectToCommandCenter(input: {
  parentOrigin: string;
  onContext: (context: EmbedContext) => void;
  onFastApiStateChange?: (state: StaticSiteFastApiTransportState) => void;
  onProtocolError?: (message: string) => void;
  browserWindow?: Window;
}): CommandCenterConnection {
  const browserWindow = input.browserWindow ?? window;
  const client = createStaticSiteIframeClient({
    channel: MARKETS_EMBED_CHANNEL,
    hostOrigin: input.parentOrigin,
    parentWindow: browserWindow.parent,
    onContext: input.onContext,
    onFastApiStateChange: input.onFastApiStateChange,
    onProtocolError: input.onProtocolError,
  });
  const handleMessage = (event: MessageEvent<unknown>) => {
    client.handleMessage(event);
  };

  browserWindow.addEventListener("message", handleMessage);
  client.announceReady();

  const connection: CommandCenterConnection = {
    fetchFastApi: (...args) => client.fetchFastApi(...args),
    getFastApiState: (...args) => client.getFastApiState(...args),
    disconnect: () => {
      browserWindow.removeEventListener("message", handleMessage);
      client.dispose();
      if (activeConnection === connection) activeConnection = null;
    },
  };
  activeConnection = connection;
  return connection;
}

export function getCommandCenterConnection(): CommandCenterConnection | null {
  return activeConnection;
}
