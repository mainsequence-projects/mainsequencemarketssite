# Changelog

## Unreleased

- Upgraded the vendored Command Center SDK and installed skill bundle to `0.1.13`, refreshed the
  FastAPI OpenAPI artifact to 158 operations, and switched account and pricing-curve activation to
  canonical row details while retaining summaries as separate detail tabs.
- Completed the strict collection cutover for all 25 backend lists and sibling discovery routes;
  the site has no response-format switch, legacy pagination normalizer, or standalone bulk-action
  discovery fallback.
- Pinned local development and npm package execution to Node.js 24, matching the static-site
  deployment runtime.
- Added a VS Code full-stack compound debugger that launches the sibling Markets FastAPI
  development app on port 8001 and this Vite frontend on port 3010 with an explicit local API
  origin.
- Upgraded the repository-contained Command Center SDK and project skill bundle to `0.1.11`,
  replaced the custom standalone sidebar with the public controlled application navigation shell,
  and retained SDK theme presets and closed tokens across all chrome and content surfaces.
- Removed the misleading standalone gateway-session indicator and application-owned theme switch;
  standalone mode uses the default SDK preset and iframe mode follows repeated host theme updates.
- Added the `main`-only **Main Sequence Markets** static-site workflow with automatic redeployment,
  Vite/Node 24 build settings, SPA fallback, and the stable production Markets FastAPI release UID.
  The SDK resolves the release's current opaque RPC endpoint at request time, so automatic API
  redeployments remain linked without copying a runtime URL into the browser build.
- Replaced embedded direct-origin browser requests with SDK `fetchFastApi` delegated transport and
  explicit lifecycle diagnostics; standalone local development retains the exact-origin transport.
- Replaced the workstation-local SDK dependency with a repository-contained SDK `0.1.11` archive so
  remote builds are reproducible while the corresponding registry release is unavailable.

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
