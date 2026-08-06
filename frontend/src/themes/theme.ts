import {
  applyThemePresetToRoot,
  mainSequenceSpaceTheme,
  quartzLightTheme,
  resolveCommandCenterThemeById,
  type ThemePreset,
} from "@dev-mainsequence/command-center-sdk/theme";

export type ThemeMode = "dark" | "light";
export const DEFAULT_THEME_ID = mainSequenceSpaceTheme.id;

export function resolveMarketsTheme(themeId?: string | null, mode?: ThemeMode): ThemePreset {
  return (
    (themeId ? resolveCommandCenterThemeById(themeId) : undefined)
    ?? (mode === "light" ? quartzLightTheme : mainSequenceSpaceTheme)
  );
}

export function applyMarketsTheme(
  themeId?: string | null,
  mode?: ThemeMode,
  root: HTMLElement = document.documentElement,
): ThemePreset {
  const publishedTheme = themeId ? resolveCommandCenterThemeById(themeId) : undefined;
  const theme = publishedTheme ?? resolveMarketsTheme(null, mode);
  const resolvedMode = mode ?? theme.mode;

  applyThemePresetToRoot(root, { theme });
  if (!publishedTheme && themeId) root.dataset.theme = themeId;
  root.dataset.themeMode = resolvedMode;
  root.style.colorScheme = resolvedMode;
  root.classList.toggle("dark", resolvedMode === "dark");
  return theme;
}
