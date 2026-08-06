# Frontend architecture

## Ownership

This repository owns the Markets product shell, navigation, route state, mutation dialogs, and
domain content. The Command Center SDK owns generic resource-view composition and lifecycle,
theme, and static-site iframe lifecycles. The `mainsequencemarkets` service owns financial/domain
logic and the canonical OpenAPI contract. Command Center is the optional iframe host.

The application has no runtime source-checkout imports and no Main Sequence Python SDK dependency.

## Application shape

`frontend/` is one Vite package:

- `src/app/` contains bootstrap, routing, the shell, and runtime context;
- `src/features/resources/` maps operation-backed registries and details onto SDK resource views;
- `src/features/pricing-market-data/` and `src/features/settings/` contain composed surfaces;
- `src/lib/api/` contains the exact-origin client and generated OpenAPI types;
- `src/lib/embed/` connects the SDK static-site iframe client; and
- `src/themes/` applies presets from the SDK theme entrypoint.

List/detail pages are driven by explicit resource definitions. `ResourceListPage` owns collection
search, declared filters, sorting, authoritative pagination, selection, bulk-action confirmation,
refresh, and standard states. `ResourceDetailShell` and `EntitySummary` own detail composition.
The application adapter owns endpoint/query normalization, and every request carries an OpenAPI
`operationId` without exposing credentials.

The same rule applies below the top-level routes. Ten related collections render as scoped embedded
`ResourceListPage` applications; non-collection summaries, snapshots, delete-impact documents, and
tabular frames remain domain content inside `ResourceDetailShell`. Pricing Market Data and Settings
are singleton detail compositions, with their collections and metadata placed in controlled SDK
tabs.

The SPA uses a small project-owned History API router. During implementation, the available React
Router releases were covered by high-severity production advisories. Removing that dependency kept
deep-link and back/forward behavior while producing a clean production dependency audit.

## Request boundary

The API client accepts only application-relative paths and resolves them against one validated
`VITE_API_BASE_URL`. Requests use `credentials: include`, allowing the deployed authenticated gateway
to establish user identity. The client never creates an authorization header from iframe context.

## UI states

Every registry receives loading, empty/no-results, pagination, selection, error, retry, and refresh
behavior from the SDK. Mutation forms remain application-owned: they show their exact operation ID,
validate JSON before submission, and require confirmation. Their list/get/create/update/delete,
detail-action, and bulk transports run through normalized resource adapters. Destructive operations
use a separate visual treatment.
