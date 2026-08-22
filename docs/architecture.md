# Frontend architecture

## Ownership

This repository owns Markets route state, the optional standalone shell, operation dialogs, API
transport, and domain content. When embedded, Main Command Center owns global navigation,
application selection, account/global settings, session chrome, and global branding; the child
renders only its selected route content. The Command Center SDK owns controlled standalone
navigation, generic resource-view composition and lifecycle, theme, and static-site iframe
lifecycles. The `mainsequencemarkets`
service owns financial/domain logic, authorization, the canonical OpenAPI contract, and discovered
bulk-action availability.

The application has no runtime source-checkout imports and no Main Sequence Python SDK dependency.

## Application shape

The repository root is one Vite package:

- `src/app/` contains bootstrap, routing, the shell, and runtime context;
- `src/features/resources/` maps operation-backed registries and details onto SDK resource views;
- `src/features/pricing-market-data/` and `src/features/settings/` contain composed surfaces;
- `src/lib/api/` contains the exact-origin client and generated OpenAPI types;
- `src/lib/embed/` connects the SDK static-site iframe client; and
- `src/themes/` applies presets from the SDK theme entrypoint.

Standalone navigation uses SDK `ApplicationNavigationShell` from the public `/navigation`
entrypoint. The rail contains five stable application sections—Assets, Portfolios, Managed
Accounts, Pricing, and Platform—and each section opens its own grouped destination submenu. SDK
navigation intents are translated into the project-owned History API router. The SDK owns the rail,
grouped destination panel, active state, collapse behavior, keyboard navigation, focus treatment,
and tooltips. The application owns route paths. It has no application-owned theme or session
controls: standalone mode uses the default SDK preset, while embedded mode follows every theme
context update sent by the Command Center SDK host.
Embedded mode intentionally omits this shell because Main Command Center owns global application
navigation.

The SDK theme preset is applied to the document root in both standalone and embedded modes. SDK
navigation and resource views consume the published variables directly, while application CSS uses
only published tokens or aliases derived from them. The closed-token theme audit is a required build
gate.

List/detail pages are driven by explicit resource definitions. `ResourceListPage` owns collection
search, declared filters, authoritative pagination, selection, discovered bulk-action confirmation,
preflight, execution, refresh, and standard states. One shared SDK HTTP resource adapter is used for
every collection. Collection bodies pass through directly as
`command-center.resource_collection@v1`; the application contains no `count`/`results`, bare-array,
or endpoint-specific response normalization. `command-center.resource_discovery@v1` owns identity,
controls, ordered columns, and authorized bulk actions. `ResourceDetailShell` and `EntitySummary`
own detail composition. Pinned OpenAPI operations carry their operation ID.

The same rule applies below the top-level routes. Ten related collections render as scoped embedded
`ResourceListPage` applications through the same canonical adapter and discovery convention;
non-collection summaries, snapshots, delete-impact documents, and tabular frames remain domain
content inside `ResourceDetailShell`. Pricing Market Data and API Diagnostics are singleton detail
compositions, with their collections and metadata placed in controlled SDK tabs.

Account and pricing-curve activation resolve canonical row details through `getAccount` and
`getPricingCurve`. Their `FrontEndDetailSummary` operations are separate tabs; a summary payload is
never used as the resource identity record.

The SPA uses a small project-owned History API router. During implementation, the available React
Router releases were covered by high-severity production advisories. Removing that dependency kept
deep-link and back/forward behavior while producing a clean production dependency audit.

## Request boundary

The API client accepts only application-relative paths and resolves them against one validated
`VITE_API_BASE_URL` in standalone mode. Embedded requests use the configured FastAPI release UID and
the SDK's memory-only delegated credential transport. Standalone requests use
`credentials: include`, allowing the deployed authenticated gateway to establish user identity. The
application never constructs or persists a delegated authorization header itself.

## UI states

Every registry receives loading, empty/no-results, pagination, selection, error, retry, refresh,
and discovered bulk-action behavior from the SDK. Operation forms remain application-owned: they
show their exact operation ID, distinguish input-driven GET operations from mutations, validate
JSON before submission, and require an explicit dialog action. List/get/create/update/delete and
detail-action transports run through the SDK resource adapter boundary. Backend-discovered bulk
actions use SDK discovery, optional preflight, reauthorization, execution, refresh, and cleanup.
Destructive operations use SDK danger tokens and a separate semantic treatment.
