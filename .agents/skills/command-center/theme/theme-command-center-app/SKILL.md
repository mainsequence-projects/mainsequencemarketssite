---
name: theme-command-center-app
description: Apply, extend, review, or troubleshoot Command Center themes with @dev-mainsequence/command-center-sdk/theme and its CSS subpaths. Use for theme presets, CSS variables, data-visualization palettes, density and surface metrics, Tailwind integration, optional Markdown or library skins, or host-to-iframe theme propagation.
---

# Theme A Command Center Application

## Load The Published Theme Surface

Inspect the installed `/theme`, `/theme/presets`, and `/theme/data-viz` declarations and declared
CSS exports. Import the browser-ready base stylesheet once. Import optional Markdown, AG Grid,
React Flow, or React Grid Layout skins only when the application uses those libraries.

For Tailwind v4, load Tailwind first, then the SDK mapping and SDK theme styles. Do not copy the
SDK CSS into application source or import unpublished theme files.

## Apply Themes Through Tokens

1. Resolve a published theme by stable id.
2. Apply it to the intended root element with the SDK DOM helper or build a serialized style block
   for a controlled embed boundary.
3. Use exported density, surface hierarchy, and data-visualization helpers instead of hardcoded
   approximations.
4. Build application components from CSS variables so preset changes propagate consistently.

## Preserve Compatibility

Keep released theme ids and token keys stable. Treat removal or renaming as a breaking change.
When a host persists a theme id, coordinate a preference migration before changing it.

Keep portable theme CSS separate from framework-specific skins. Keep authentication, storage,
application registries, and routing outside the theme layer.

## Verify

Test at least one plain CSS consumer, active preset switching, fallback theme resolution, and every
optional library skin changed by the task. Check contrast and nested-surface hierarchy in both dark
and light presets when available.
