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

  it.each([mainSequenceSpaceTheme, quartzLightTheme])(
    "keeps application text and destructive controls legible in $id",
    (theme) => {
      expect(contrastRatio(theme.tokens.background, theme.tokens.foreground)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.tokens.card, theme.tokens["card-foreground"])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.tokens.danger, theme.tokens["danger-foreground"])).toBeGreaterThanOrEqual(4.5);
    },
  );
});

function contrastRatio(left: string, right: string): number {
  const leftLuminance = relativeLuminance(left);
  const rightLuminance = relativeLuminance(right);
  return (Math.max(leftLuminance, rightLuminance) + 0.05)
    / (Math.min(leftLuminance, rightLuminance) + 0.05);
}

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((value) => Number.parseInt(value, 16) / 255);
  if (!channels || channels.length !== 3 || channels.some(Number.isNaN)) {
    throw new Error(`Expected a six-digit hexadecimal color, received ${hex}.`);
  }
  const [red, green, blue] = channels.map((value) => (
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
