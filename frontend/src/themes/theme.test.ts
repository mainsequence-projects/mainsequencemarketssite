import { mainSequenceSpaceTheme, quartzLightTheme } from "@dev-mainsequence/command-center-sdk/theme";
import { describe, expect, it } from "vitest";

import { applyMarketsTheme } from "@/themes/theme";

describe("Markets SDK theme integration", () => {
  it("applies a published SDK preset to the requested root", () => {
    const root = document.createElement("div");
    const theme = applyMarketsTheme(quartzLightTheme.id, "light", root);

    expect(theme.id).toBe(quartzLightTheme.id);
    expect(root.dataset.theme).toBe(quartzLightTheme.id);
    expect(root.dataset.commandCenterThemeRoot).toBe("true");
    expect(root.style.colorScheme).toBe("light");
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.getPropertyValue("--background")).not.toBe("");
  });

  it("preserves an unknown host theme ID while falling back by mode", () => {
    const root = document.createElement("div");
    const theme = applyMarketsTheme("future-command-center-theme", "dark", root);

    expect(theme.id).toBe(mainSequenceSpaceTheme.id);
    expect(root.dataset.theme).toBe("future-command-center-theme");
    expect(root.style.colorScheme).toBe("dark");
    expect(root.classList.contains("dark")).toBe(true);
  });
});
