# Changelog

## Unreleased

- Upgraded the editable Command Center SDK and managed skill bundle to 0.1.9, adopted the expanded
  theme tokens and delegated FastAPI transport surface, and made the SDK theme audit a
  production-build gate.
- Aligned the application with Command Center SDK 0.1.3 ownership: embedded mode now renders route
  content without duplicating Main Command Center navigation, branding, settings, or session chrome.
- Removed unsupported server-sorting declarations from all 12 resource collections.
- Replaced three frontend-synthesized bulk-delete definitions with backend discovery, optional
  preflight, reauthorization, and execution through the published SDK contracts.
- Renamed the retained `/settings` experience to Markets API Diagnostics and kept it out of embedded
  global navigation.
- Distinguished input-driven GET operations from mutation dialogs, refreshed affected detail
  content after domain actions, and moved remaining application colors onto SDK theme tokens.
- Replaced the hand-written iframe E2E host with SDK `StaticSiteIframe` coverage for sandbox,
  chrome ownership, handshake, and repeated theme propagation.
- Completed the application-wide Command Center SDK refactor: all registries, entity details,
  related collections, Pricing Market Data, and Settings now use normalized SDK views.
- Moved list/get/create/update/delete, detail-action, and explicit bulk transport behind normalized
  SDK resource adapters, with canonical SDK action and scoped related-application identifiers.
- Replaced the application-owned iframe parser with the SDK static-site client and removed
  non-version-one navigation, resize, display-name, and auth-expired messages.
- Moved theme presets, helpers, fonts, and base styles to the Command Center SDK theme entrypoint.
- Added the standalone/embedded Vite React Markets application.
- Added direct exact-origin `apps/v1` API requests with gateway credentials and explicit failures.
- Added all accepted Markets route families, list/detail views, filters, pagination, and available
  OpenAPI-backed mutations.
- Added the versioned no-credentials iframe protocol and published Command Center theme integration.
- Pinned the 128-operation OpenAPI contract and generated TypeScript operation types.
- Added lint, typecheck, unit, build, generated-contract, Playwright, and responsive browser checks.
