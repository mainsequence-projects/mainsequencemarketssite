import type { StaticSiteFastApiTransportState } from "@dev-mainsequence/command-center-sdk/embed";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { RuntimeConfiguration } from "@/config/runtime";
import {
  connectToCommandCenter,
  type EmbedContext,
} from "@/lib/embed/context";
import { applyMarketsTheme, DEFAULT_THEME_ID, type ThemeMode } from "@/themes/theme";

type RuntimeContextValue = {
  configuration: RuntimeConfiguration;
  themeMode: ThemeMode;
  themeId: string;
  userUid: string | null;
  initialized: boolean;
  embedError: string | null;
  fastApiState: StaticSiteFastApiTransportState | null;
};

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export function RuntimeProvider({
  configuration,
  children,
}: {
  configuration: RuntimeConfiguration;
  children: ReactNode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [themeId, setThemeId] = useState(DEFAULT_THEME_ID);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(!configuration.embedded);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [fastApiState, setFastApiState] = useState<StaticSiteFastApiTransportState | null>(null);

  useEffect(() => {
    applyMarketsTheme(themeId, themeMode);
  }, [themeId, themeMode]);

  useEffect(() => {
    if (!configuration.embedded || !configuration.commandCenterOrigin) return;
    const connection = connectToCommandCenter({
      parentOrigin: configuration.commandCenterOrigin,
      onContext: (context: EmbedContext) => {
        setThemeMode(context.themeMode);
        setThemeId(context.themeId);
        setUserUid(context.userUid);
        setEmbedError(null);
        setInitialized(true);
      },
      onFastApiStateChange: setFastApiState,
      onProtocolError: setEmbedError,
    });
    return () => connection.disconnect();
  }, [configuration.commandCenterOrigin, configuration.embedded]);

  const value = useMemo<RuntimeContextValue>(() => ({
    configuration,
    themeMode,
    themeId,
    userUid,
    initialized,
    embedError,
    fastApiState,
  }), [configuration, embedError, fastApiState, initialized, themeId, themeMode, userUid]);

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function useRuntime(): RuntimeContextValue {
  const value = useContext(RuntimeContext);
  if (!value) throw new Error("useRuntime must be used within RuntimeProvider.");
  return value;
}
