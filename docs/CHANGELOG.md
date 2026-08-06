# Changelog

## Unreleased

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
