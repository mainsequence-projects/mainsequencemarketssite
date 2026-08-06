---
name: host-command-center-widgets
description: Build or change a widget host with @dev-mainsequence/command-center-sdk/widget/host and runtime contracts. Use for composing extensions, creating collision-safe registries, resolving exact widget IDs, reporting availability, injecting runtime capabilities, preserving unavailable widget instances, or integrating portable built-ins without application-global dependencies.
---

# Host Command Center Widgets

## Read The Installed Host Contract

Inspect `/widget`, `/widget/host`, runtime-context declarations, built-in exports, and host tests in
the installed SDK version. Do not assume registry publication or application-specific runtime APIs
exist merely because a consumer implements them.

## Compose Explicitly

1. Collect installed extensions and their package name, package version, and widget modules.
2. Build the registry explicitly with the SDK registry helper.
3. Treat exact canonical widget ids as identity. Trim only the whitespace normalization supported
   by the SDK; do not introduce aliases.
4. Fail exact id collisions and report every contributing package.
5. Distinguish executable runtime availability from serialized manifest compatibility, permission,
   and any externally supplied registration state.
6. Inject runtime capabilities, theme, navigation, telemetry, and data behavior through supported
   provider contracts rather than global imports.

Use portable `/widget/built-ins` when their declared behavior fits. Import each required built-in
stylesheet once.

## Preserve Documents And Trust Boundaries

Backend or catalog metadata may describe a widget but must never provide executable code. Missing,
retired, incompatible, or forbidden widgets produce deterministic unavailable diagnostics; they do
not rewrite persisted workspace ids or delete instances.

Keep React and React DOM shared through peer dependencies. Keep consumer transport, persistence,
authentication, and publication policy outside the SDK registry.

## Verify

Test extension composition, provenance, collisions, whitespace normalization, exact lookup,
missing runtime, incompatible manifest, permission denial, built-ins, injected capabilities, and
React peer behavior.
