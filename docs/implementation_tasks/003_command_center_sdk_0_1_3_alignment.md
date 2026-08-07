# 003. Command Center SDK 0.1.3 Alignment Plan

- **Status:** frontend implementation complete; backend contract and deployment pending
- **Planning date:** 2026-08-07
- **Frontend completion date:** 2026-08-07
- **Application:** `frontend/`
- **SDK:** editable `@dev-mainsequence/command-center-sdk@0.1.3`
- **Static-site protocol:** `mainsequence.*`, numeric version `1`
- **Supersedes:** the application-shell ownership and SDK-version assumptions in task 002

## Objective

Align the complete Markets frontend with the application, resource, action, theme, and project-owned
static-site iframe guidance shipped with Command Center SDK 0.1.3. The prior refactor established the
correct high-level SDK components, but this review found remaining ownership and contract mismatches.

This document began as the implementation plan and now includes the frontend execution record. It
makes every business action found at the baseline explicit so that implementation does not silently
preserve or relocate an action.

## Planning Authority

The plan follows the installed SDK package and the version-matched skills copied into
`.agents/skills/command-center/`:

- `build-command-center-application` for application-wide surface selection;
- `use-command-center-sdk` for package entrypoints, peer dependencies, and CSS ownership;
- `build-resource-list`, `build-resource-detail`, and `add-resource-actions` for view composition;
- `adapt-resource-backend` and `implement-bulk-actions-contract` for transport contracts;
- `integrate-static-site-iframe` for the project-owned `mainsequence.*` iframe lifecycle; and
- `theme-command-center-app` for theme tokens and host propagation.

Contract names and schema identifiers below come from the installed
`@dev-mainsequence/command-center-sdk/contracts/manifest.json`. Schema bodies must not be copied into
this repository.

## Architecture Decision

### Application purpose

Markets is a separately built and deployed React static-site application for browsing and operating
on the `apps/v1` Markets API. It remains a routed application, not a portable widget, workspace
document, or Command Center source extension.

### Main Command Center embedding

The whole application uses the project-owned static-site protocol through
`createStaticSiteIframeClient`. The parent host must use `StaticSiteIframe`. The channel remains
`mainsequence.markets`, the protocol version remains numeric `1`, and the child accepts messages only
from the exact configured parent origin.

When embedded, Main Command Center owns:

- global and application navigation;
- application selection and switching;
- account, session, and organization chrome;
- global settings; and
- MainSequence branding.

The child must therefore render only Markets route content after initialization. A standalone shell
may remain for local development or direct deployment, but it must be selected explicitly from
runtime mode and must never appear inside the Command Center iframe.

### Theme integration

Use the public SDK `/theme` entrypoint and packaged theme/view CSS exactly once. Apply the normalized
host `themeId` and `themeMode` received from the iframe client. Application CSS may define domain
layout, but colors, surfaces, borders, type, density, focus, and visualization palettes must use SDK
tokens.

### Application-owned routes

The existing History API routes and route URLs remain application-owned for compatibility. The
`/settings` route may remain as Markets API diagnostics/metadata, but it must not present itself as
Command Center global settings and must not appear in embedded global navigation.

### Resource collections

All 12 top-level collections continue to use `ResourceListPage`. The 10 related collections continue
to use embedded `ResourceListPage`. Identity-column activation is the navigation mechanism; there is
no synthetic **Open** action column. Search and filters are declared only when supported by the
pinned API contract. Sorting is not declared until the backend exposes an authoritative ordering
parameter.

### Resource details

All 12 entity routes continue to use `ResourceDetailShell` and `EntitySummary`. Breadcrumbs, loading,
error, summary, flat tabs, and header action placement remain controlled through the SDK surface.
Related collections stay embedded in tabs; arbitrary summaries, delete-impact data, snapshots, and
tabular-frame payloads remain application-owned tab content.

### Action placement

- create actions are custom `ResourceListPage.primaryActions`;
- row activation opens details, so no navigation action is added to row menus;
- edit, single-delete, and domain actions appear in `ResourceDetailShell.headerActions`;
- custom actions use stable lowercase SDK action IDs derived from OpenAPI operation IDs;
- destructive actions require explicit confirmation and remain server-authorized;
- bulk actions come from backend discovery and are executed by the SDK bulk-action lifecycle; and
- current-page explicit selection and all-matching selection are different contracts and must never
  be inferred from each other.

### Portable widgets and workspace composition

No portable widget or workspace surface is selected. The application is embedded as one routed
static site, and its resource pages are not persisted widget instances.

### Backend adapters and contracts

The frontend keeps a consumer-owned `ResourceAdapter` around the Markets browser transport. List
responses must conform to `command-center.resource_collection@v1`
(`urn:mainsequence:command-center-sdk:schema:resource-collection:v1`). Bulk discovery, execution, and
preflight must use:

- `command-center.bulk_action_discovery@v1`
  (`urn:mainsequence:command-center-sdk:schema:bulk-action-discovery:v1`);
- `command-center.bulk_action_execution@v1`
  (`urn:mainsequence:command-center-sdk:schema:bulk-action-execution:v1`); and
- `command-center.bulk_action_preflight@v1`
  (`urn:mainsequence:command-center-sdk:schema:bulk-action-preflight:v1`).

The backend is authoritative for action availability, authorization, blockers, confirmation
metadata, and the final outcome. The frontend remains responsible for its exact API origin, browser
credentials, abort signals, and mapping its OpenAPI operations into the SDK adapter.

### Rejected alternatives

| Alternative | Reason rejected |
| --- | --- |
| Keep the full Markets sidebar/topbar inside the iframe | Duplicates global navigation, session chrome, branding, and settings owned by Main Command Center. |
| Replace the application with a widget/workspace | The product is a routed static-site application with compatible URLs, not one portable widget instance. |
| Continue synthesizing bulk actions in the browser | Availability and authorization can become stale; SDK 0.1.3 provides discovery, preflight, and execution contracts. |
| Advertise sorting for every displayed column | None of the 12 current list operations declares the serialized `ordering` parameter. |
| Add an **Open** row action | Identity-column activation already owns navigation. |
| Copy SDK JSON schemas into application source | Creates contract drift; consumers must use the installed manifest, schemas, types, and fixtures. |
| Use the generic widget iframe protocol | This is a project-owned static site and must use the `mainsequence.*` ready/initialize protocol. |

## Baseline Alignment Assessment Before Implementation

| Area | Current state | Required decision |
| --- | --- | --- |
| SDK installation | Aligned: editable 0.1.3 dependency, public entrypoints, one React runtime | Keep and add a version/provenance verification gate. |
| Application boundary | Not aligned: embedded mode still renders Markets branding, sidebar, topbar, settings link, and session status | Split embedded content root from optional standalone shell. |
| Top-level lists | Structurally aligned: 12 use `ResourceListPage` | Remove unsupported sort declarations; retain API-backed search/filters/pagination. |
| Related lists | Structurally aligned: 10 use embedded `ResourceListPage` | Preserve scoped identity and add lifecycle tests. |
| Details | Structurally aligned: 12 use `ResourceDetailShell` and `EntitySummary` | Keep actions in the header and expand loading/error/tab tests. |
| Resource actions | Partially aligned: placement is mostly correct, but all 36 definitions are frontend-configured | Keep allowed custom CRUD/domain actions explicit; migrate the 3 bulk actions to discovery. |
| Bulk actions | Not aligned: `bulkActions` and confirmation metadata are synthesized from `bulkRemove` | Add discovery, optional preflight, reauthorization, and contract validation. |
| Iframe child | Aligned: listener-before-ready, exact origin, repeated/anonymous context, cleanup | Replace the raw test host with SDK `StaticSiteIframe` coverage and verify host defaults. |
| Theme | Mostly aligned | Remove embedded shell styling and migrate remaining hardcoded app colors to SDK tokens. |
| Documentation | Stale: task 002 pins 0.1.2 and calls the whole product shell consumer-owned | Treat this task as the 0.1.3 ownership correction. |

## Explicit Inventory Of Hardcoded Resource Actions

“Hardcoded action” here means a business operation whose label, OpenAPI operation ID, HTTP method,
path builder, description, request template, or destructive flag is configured in
`frontend/src/features/resources/resource-definitions.ts`. It does not mean ordinary UI mechanics
such as opening the mobile menu, retrying a failed query, or changing a standalone-only theme.

At the baseline there were **36** configured business actions: 7 create, 7 update, 10 single-delete,
9 domain, and 3 bulk-delete actions. The frontend exposed no separate row-menu actions. The
implementation retains the 33 custom create/update/delete/domain actions and replaces the 3 static
bulk definitions with backend discovery endpoints.

### Collection primary actions — 7

These may remain application-owned primary actions because the SDK explicitly supports custom
`primaryActions`. Each must stay backed by a declared OpenAPI operation and the adapter's `create`
method. Request templates are presentation defaults, not API schemas or authorization rules.

| Resource | Label | OpenAPI operation | Request | Target treatment |
| --- | --- | --- | --- | --- |
| Asset Categories | Create category | `createAssetCategory` | `POST /api/v1/asset-category/` | Keep as collection primary action. |
| Indices | Create index | `createIndex` | `POST /api/v1/index/` | Keep as collection primary action. |
| Calendars | Create calendar | `createCalendar` | `POST /api/v1/calendar/` | Keep as collection primary action. |
| Portfolio Groups | Create group | `createPortfolioGroup` | `POST /api/v1/portfolio-group/` | Keep as collection primary action. |
| Portfolio Signals | Create signal | `createPortfolioSignal` | `POST /api/v1/portfolio-signal/` | Keep as collection primary action. |
| Market Data Sets | Create data set | `createPricingMarketDataSet` | `POST /api/v1/pricing/market_data/sets/` | Keep as collection primary action. |
| Market Data Bindings | Create binding | `createPricingMarketDataBinding` | `POST /api/v1/pricing/market_data/bindings/` | Keep as collection primary action. |

### Detail edit actions — 7

These remain application-owned header actions and execute through `adapter.update`. They must refresh
the detail only after success and leave server authorization authoritative.

| Resource | Label | OpenAPI operation | Request | Target treatment |
| --- | --- | --- | --- | --- |
| Asset Categories | Edit category | `updateAssetCategory` | `PATCH /api/v1/asset-category/{uid}/` | Keep in detail header. |
| Indices | Edit index | `updateIndex` | `PATCH /api/v1/index/{uid}/` | Keep in detail header. |
| Calendars | Edit calendar | `updateCalendar` | `PATCH /api/v1/calendar/{uid}/` | Keep in detail header. |
| Portfolio Groups | Edit group | `updatePortfolioGroup` | `PATCH /api/v1/portfolio-group/{uid}/` | Keep in detail header. |
| Portfolio Signals | Edit description | `updatePortfolioSignal` | `PATCH /api/v1/portfolio-signal/{uid}/` | Keep in detail header. |
| Market Data Sets | Edit data set | `updatePricingMarketDataSet` | `PATCH /api/v1/pricing/market_data/sets/{uid}/` | Keep in detail header. |
| Market Data Bindings | Edit binding | `updatePricingMarketDataBinding` | `PATCH /api/v1/pricing/market_data/bindings/{uid}/` | Keep in detail header. |

### Detail single-delete actions — 10

These remain destructive detail-header actions and execute through `adapter.delete`. Confirmation is
mandatory. Successful deletion navigates to the collection; a failure keeps the current detail and
shows the backend error.

| Resource | Label | OpenAPI operation | Request | Target treatment |
| --- | --- | --- | --- | --- |
| Assets | Delete asset | `deleteAsset` | `DELETE /api/v1/asset/{uid}/` | Keep in detail header with confirmation. |
| Asset Categories | Delete category | `deleteAssetCategory` | `DELETE /api/v1/asset-category/{uid}/` | Keep in detail header with confirmation. |
| Indices | Delete index | `deleteIndex` | `DELETE /api/v1/index/{uid}/` | Keep after delete-impact review. |
| Calendars | Delete calendar | `deleteCalendar` | `DELETE /api/v1/calendar/{uid}/` | Keep in detail header with confirmation. |
| Portfolios | Delete portfolio | `deletePortfolio` | `DELETE /api/v1/portfolio/{uid}/` | Keep in detail header with confirmation. |
| Portfolio Groups | Delete group | `deletePortfolioGroup` | `DELETE /api/v1/portfolio-group/{uid}/` | Keep in detail header with confirmation. |
| Portfolio Signals | Delete signal | `deletePortfolioSignal` | `DELETE /api/v1/portfolio-signal/{uid}/` | Keep in detail header with confirmation. |
| Pricing Curves | Delete curve | `deletePricingCurve` | `DELETE /api/v1/pricing/curves/{uid}/` | Keep after delete-impact review. |
| Market Data Sets | Delete data set | `deletePricingMarketDataSet` | `DELETE /api/v1/pricing/market_data/sets/{uid}/` | Keep in detail header with confirmation. |
| Market Data Bindings | Delete binding | `deletePricingMarketDataBinding` | `DELETE /api/v1/pricing/market_data/bindings/{uid}/` | Keep in detail header with confirmation. |

### Detail domain actions — 9

These remain explicit custom header actions and execute through `adapter.executeAction`. Their
operation IDs are transport metadata; their derived SDK IDs are presentation/action identifiers.
The **Load discount curve** GET is an operation with inputs, not a mutation, and its dialog should be
named and tested accordingly.

| Resource | Label | OpenAPI operation | Request | Destructive | Target treatment |
| --- | --- | --- | --- | ---: | --- |
| Calendars | Add date | `createCalendarDate` | `POST /api/v1/calendar/{uid}/dates/` | No | Keep in detail header; refresh Dates tab after success. |
| Calendars | Add session | `createCalendarSession` | `POST /api/v1/calendar/{uid}/sessions/` | No | Keep in detail header; refresh Sessions tab after success. |
| Calendars | Add event | `createCalendarEvent` | `POST /api/v1/calendar/{uid}/events/` | No | Keep in detail header; refresh Events tab after success. |
| Portfolios | Delete weights | `deletePortfolioWeights` | `DELETE /api/v1/portfolio/{uid}/weights/` | Yes | Keep with confirmation; refresh Weights content. |
| Portfolio Groups | Add portfolio | `addPortfolioToGroup` | `POST /api/v1/portfolio-group/{uid}/portfolios/` | No | Keep in detail header; refresh Portfolios tab. |
| Portfolio Signals | Delete weights | `deletePortfolioSignalWeights` | `DELETE /api/v1/portfolio-signal/{uid}/weights/` | Yes | Keep with confirmation; refresh detail. |
| Accounts | Add holdings | `addAccountHoldings` | `POST /api/v1/account/{uid}/add-holdings/` | No | Keep in detail header; refresh Holdings tabs. |
| Accounts | Add target positions | `addAccountTargetPositions` | `POST /api/v1/account/{uid}/add-target-positions/` | No | Keep in detail header; refresh Target positions tab. |
| Pricing Curves | Load discount curve | `getPricingDiscountCurve` | `GET /api/v1/pricing/curves/{uid}/discount-curve/` | No | Keep as input-driven header operation; show result in a controlled tab. |

### Bulk actions synthesized in the frontend at baseline — 3

These are the hardcoded actions that must not remain static. Today
`frontend/src/features/resources/resource-adapter.ts` converts `bulkRemove` into a
`ResourceBulkActionDefinition`, hardcodes explicit-only selection and confirmation copy, then calls
the endpoint directly.

| Resource | Label | OpenAPI operation | Request | Current selection | Target treatment |
| --- | --- | --- | --- | --- | --- |
| Asset Categories | Delete selected | `bulkDeleteAssetCategories` | `POST /api/v1/asset-category/bulk-delete/` | Explicit UIDs | Move to backend discovery/preflight/execution. |
| Portfolios | Delete selected | `bulkDeletePortfolios` | `POST /api/v1/portfolio/bulk-delete/` | Explicit UIDs | Move to backend discovery/preflight/execution. |
| Portfolio Groups | Delete selected | `bulkDeletePortfolioGroups` | `POST /api/v1/portfolio-group/bulk-delete/` | Explicit UIDs | Move to backend discovery/preflight/execution. |

The migration must:

1. add a backend discovery route per resource boundary or one correctly scoped shared route;
2. return only actions authorized for the caller and current normalized query;
3. configure `createHttpResourceAdapter.endpoints.bulkActions` or implement `listBulkActions`;
4. implement `preflightBulkAction` when impact or blockers can change;
5. rediscover or reauthorize immediately before execution;
6. preserve explicit UID selection unless the backend explicitly advertises `all_matching`;
7. send normalized API filters, never presentation-only state, for all-matching selection;
8. let `ResourceListPage` own confirmation, pending state, refresh, and selection cleanup; and
9. validate discovery, preflight, and execution payloads against the installed SDK contracts and
   fixtures.

The existing membership endpoint
`POST /api/v1/portfolio-group/membership/bulk-delete/` is not currently exposed as a top-level
collection bulk action. It must not be added implicitly. It requires a separate product decision,
resource scope, discovery result, and UI placement.

## Unsupported Sorting Inventory

The current adapter assigns `sortableKey` to every displayed column, declares every column in
`controls.ordering`, and serializes `ordering`. The pinned OpenAPI list operations below do not
declare that parameter, so the UI promises a server capability the backend has not accepted.

| Collection | List operation | Declared search/filter parameters | Ordering decision |
| --- | --- | --- | --- |
| Assets | `listAssets` | `search`, `categories__uid` | Remove sorting. |
| Asset Categories | `listAssetCategories` | `search` | Remove sorting. |
| Indices | `listIndexes` | `search`, `index_type`, `has_formula`, `has_canonical_values`, `cadence` | Remove sorting. |
| Calendars | `listCalendars` | `search`, `unique_identifier`, `unique_identifier_contains`, `calendar_type`, `source`, `source_identifier` | Remove sorting. |
| Portfolios | `listPortfolios` | `search`, `calendar_uid` | Remove sorting. |
| Portfolio Groups | `listPortfolioGroups` | `search`, `unique_identifier`, `display_name` | Remove sorting. |
| Portfolio Signals | `listPortfolioSignals` | `search`, `signal_uid` | Remove sorting. |
| Accounts | `listAccounts` | `search` | Remove sorting. |
| Virtual Funds | `listVirtualFunds` | `search`, `account_uid`, `portfolio_uid` | Remove sorting. |
| Pricing Curves | `listPricingCurves` | `search`, `curve_type`, `source` | Remove sorting. |
| Market Data Sets | `listPricingMarketDataSets` | `status`, `set_key` | Remove sorting. |
| Market Data Bindings | `listPricingMarketDataBindings` | `market_data_set_uid`, `concept_key` | Remove sorting. |

`limit`, `offset`, and the applicable `response_format` parameter remain transport controls and are
omitted from the table for readability. Sorting may be restored per operation only after the
OpenAPI contract formally declares its accepted keys and the backend applies authoritative ordering.

## Implementation Workstreams

### Phase 0 — Freeze the alignment baseline

- pin the editable SDK provenance and verify version 0.1.3, public exports, peer dependencies, and
  one resolved React/ReactDOM runtime;
- keep the refreshed schema-2 SDK skills in `.agents/skills/command-center/`;
- record this task as the authority for SDK 0.1.3 alignment; and
- keep task 002 as the historical 0.1.2 execution record.

### Phase 1 — Correct the embedded application boundary

Files centered on: `frontend/src/app/app-shell.tsx`, runtime/bootstrap code, router tests, and shell
styles.

- branch on the normalized runtime `embedded` state after iframe initialization;
- render a thin content root in embedded mode with no sidebar, topbar, MainSequence branding,
  settings navigation, session status, app switcher, or account controls;
- retain the current shell only for explicit standalone mode;
- keep all existing application routes and direct-route behavior;
- rename/reframe `/settings` as Markets API diagnostics/metadata if the route remains; and
- ensure focus entry and skip-link behavior still reach each route's `main-content` target.

### Phase 2 — Make collection capabilities truthful

Files centered on: `frontend/src/features/resources/resource-adapter.ts`, resource definitions, and
adapter/list tests.

- remove universal `sortableKey`, `controls.ordering`, and serialized `ordering`;
- keep authoritative offset pagination and normalized `totalItems`, next, and previous state;
- continue forwarding abort signals through list requests;
- expose search and declared filters only where the operation accepts them;
- preserve stable UID identity and semantic row activation; and
- do not add an **Open** action column or a second collection lifecycle.

### Phase 3 — Normalize and verify custom CRUD/domain actions

Files centered on: resource definitions, list/detail pages, action dialog code, and tests.

- retain all 33 non-bulk actions in the explicit inventory unless a separate product decision
  removes one;
- keep create controls in `primaryActions` and update/delete/domain controls in detail
  `headerActions`;
- centralize stable SDK ID derivation, tone, confirmation, request input, and refresh policy;
- distinguish an input-driven GET operation from mutation dialogs;
- refresh the affected collection or tab only after success;
- preserve selection and current data on failure;
- make destructive confirmation accessible and operation-specific; and
- treat the frontend action declaration as presentation only, never authorization.

### Phase 4 — Replace static bulk actions with backend discovery

Frontend files centered on: resource adapter/definitions and bulk-action tests. Backend work is a
separate coordinated change against the published contracts.

- remove `bulkRemove`-to-definition synthesis after discovery is available;
- add `listBulkActions`, `preflightBulkAction`, and `executeBulkAction` through the SDK adapter
  contract;
- validate serialized discovery/preflight/execution messages with the installed schema fixtures;
- preserve explicit selection for the three current actions;
- add all-matching only when a backend-discovered action advertises it; and
- test blocked preflight, changed authorization, partial failure, success refresh, and selection
  cleanup.

The frontend must not claim this phase complete until the backend discovery contract exists. Until
then, the current explicit-only bulk behavior may be retained behind a documented temporary
compatibility flag or bulk UI may be disabled; silent permanent fallback is not acceptable.

### Phase 5 — Complete detail and related-resource lifecycle coverage

- test detail loading, retryable error, summary, controlled tab selection, breadcrumb navigation,
  and header actions;
- verify related collections use scoped collision-safe identities and embedded list composition;
- test abort/cancellation when navigating or switching tabs;
- ensure domain-action success refreshes the correct related content; and
- keep non-collection payloads in application-owned tab content without recreating SDK shells.

### Phase 6 — Harden iframe and theme integration

- retain listener-before-`announceReady`, exact-origin validation, repeated initialization,
  anonymous `userUid`, and permanent teardown behavior;
- replace the hand-written E2E parent message harness with an SDK `StaticSiteIframe` host test;
- verify default sandbox behavior, initialization timeout, payload-size rejection, invalid origin,
  invalid source, and unmount cleanup;
- confirm API authentication remains independent of the public iframe `userUid`;
- remove embedded shell CSS and replace remaining application hardcoded colors with theme tokens;
  and
- test known/unknown theme fallback, nested surfaces, focus visibility, and light/dark contrast.

### Phase 7 — Documentation and release gates

- update architecture, embedding/security, route compatibility, local development, deployment, and
  changelog documents to reflect the embedded ownership split;
- add a generated or AST-based check that keeps this action inventory synchronized with resource
  definitions;
- run generated OpenAPI drift, typecheck, lint, unit/component tests, production build, and browser
  E2E;
- run a live dependency audit only with authorization to send private dependency metadata to the
  registry; retain the offline audit as a separate reproducible gate; and
- record exact results, SDK commit/version, and any backend dependency before marking this task
  complete.

## Verification Matrix

| Concern | Required evidence |
| --- | --- |
| Package boundary | SDK 0.1.3 resolves through the editable link; only public imports; React and ReactDOM deduplicated. |
| Embedded ownership | Browser test proves embedded pages contain no child global nav/topbar/branding/settings/session chrome. |
| Standalone compatibility | Direct list/detail routes retain the optional standalone shell and route navigation. |
| Collections | Search, each declared filter, pagination, refresh, activation, empty/no-results/error states, and abort behavior. |
| Sorting | No sort affordance or `ordering` request until OpenAPI declares it. |
| Details | Loading, error/retry, summary, breadcrumbs, controlled tabs, related lists, and header actions. |
| Custom actions | Placement, stable ID, payload, destructive confirmation, backend failure, success refresh, and navigation. |
| Bulk actions | Discovery, preflight allowed/blocked, reauthorization, explicit selection, execution, partial failure, refresh, and cleanup. |
| Iframe | Real SDK host/client ready-initialize exchange, exact origin/source, repeat update, anonymous user, payload limit, timeout, sandbox, teardown. |
| Theme | Host propagation, standalone fallback, unknown theme fallback, token use, focus, contrast, and nested surfaces. |
| Security | API credentials never derive from `userUid`; no token/session/permission data enters iframe context. |

## Acceptance Criteria

1. Embedded mode renders Markets content without duplicating any Main Command Center global chrome.
2. Standalone routes remain usable and route-compatible.
3. All top-level and related collections use `ResourceListPage`; all entities use
   `ResourceDetailShell` and `EntitySummary`.
4. No collection advertises sorting unsupported by its OpenAPI operation.
5. Every one of the 36 currently configured business actions is either retained in the exact
   placement documented here, intentionally removed by a recorded product decision, or migrated to
   backend discovery.
6. The three bulk-delete actions are discovered and reauthorized by the backend and use the
   published SDK discovery, preflight, and execution contracts.
7. No **Open** action duplicates identity-column activation.
8. The iframe client and host use only the project-owned version-one static-site protocol and pass
   security/lifecycle coverage.
9. Theme and view styling come from SDK packages/tokens, with no embedded application chrome CSS.
10. OpenAPI drift, typecheck, lint, tests, production build, and the authorized audit gates pass and
    are recorded before the status changes to complete.

## Scope And Coordination Boundaries

This frontend plan does not authorize changes to API authentication, cookies, CORS, storage,
launch-token issuance, host CSP, iframe sandbox policy, or database behavior. Backend bulk discovery
and preflight are required dependencies but must be implemented and released by the backend owner
against the installed SDK contracts. Host-side `StaticSiteIframe` changes remain owned by Main
Command Center.

## Rollback

Ship the last verified frontend artifact and disable newly discovered bulk actions if the backend
contract must be rolled back. No persisted frontend schema is introduced. A rollback must not
restore unsupported sorting or duplicate embedded global chrome as an undocumented fallback.

## Frontend Execution Record

All frontend-owned phases were implemented against editable
`@dev-mainsequence/command-center-sdk@0.1.3`.

- Embedded mode now renders a thin route-content root. The standalone sidebar, topbar, branding,
  API Diagnostics navigation, and gateway-session status never render after iframe initialization.
- The standalone shell and all stable route paths remain available. `/settings` is presented as
  Markets **API Diagnostics**, not Command Center global settings.
- All top-level resource columns have no `sortableKey`, normalized controls advertise
  `ordering: []`, and list serialization no longer sends `ordering`.
- `bulkRemove` and frontend-created `ResourceBulkActionDefinition` values were removed. Asset
  Categories, Portfolios, and Portfolio Groups now configure only their backend discovery paths and
  use the SDK HTTP adapter's `listBulkActions`, `preflightBulkAction`, and `executeBulkAction` methods.
- The backend contract payload is passed unchanged as `{ selection, options }`; explicit and
  all-matching semantics, safe endpoint validation, preflight gating, rediscovery, refresh, and
  selection cleanup remain SDK-owned.
- The 33 custom CRUD/domain actions retain the placements in this document. Create actions use the
  list primary region; edit/delete/domain actions use detail header actions. Header actions are not
  rendered until the detail record has loaded.
- The application-owned operation dialog distinguishes an input-driven GET operation from a
  mutation. Destructive operations retain explicit confirmation, and successful domain actions
  invalidate detail content before exposing their result tab.
- The SDK theme packages remain loaded once. Application CSS now uses published theme tokens for
  danger, success, surfaces, overlays, foregrounds, borders, and shadows, with no literal colors in
  `frontend/src/app/globals.css`.
- The E2E iframe parent is now the published SDK `StaticSiteIframe`. Tests cover the default sandbox,
  exact-origin handshake, chrome-free child, anonymous context, and repeated light/dark theme
  updates. Unit coverage also verifies payload-limit rejection, handshake timeout, and teardown.

### Backend dependency

The frontend assumes these discovery endpoints will be supplied by the coordinated backend release:

- `GET /api/v1/asset-category/bulk-actions/`;
- `GET /api/v1/portfolio/bulk-actions/`; and
- `GET /api/v1/portfolio-group/bulk-actions/`.

Discovery, optional preflight, and execution must conform to the manifest-published contracts named
earlier in this document. These endpoints are not yet in the pinned 128-operation OpenAPI artifact,
so production deployment remains gated on the backend release and subsequent OpenAPI refresh.

### Verification evidence

| Gate | Result |
| --- | --- |
| Generated OpenAPI drift | passed; generated types match the pinned 128-operation contract |
| TypeScript | passed |
| ESLint | passed |
| Unit/component tests | 37 passed across 9 files |
| Production build | passed; Vite transformed 3,447 modules |
| Browser E2E | 8 passed, including discovered bulk lifecycle, custom detail action refresh, and SDK-hosted iframe integration |
| Theme checks | passed for SDK dark/light application presets and token-only application CSS |
| Offline dependency audit | passed; 0 vulnerabilities |

No backend, database, cookie, CORS, launch-token, host CSP, iframe sandbox policy, or storage code
was changed by this frontend implementation.
