# 002. Full Command Center SDK Application Refactor

- **Status:** complete
- **Planning date:** 2026-08-06
- **Completion date:** 2026-08-06
- **Application:** repository root
- **SDK:** editable `@dev-mainsequence/command-center-sdk@0.1.2`
- **Static-site protocol:** `mainsequence.*`, numeric version `1`

## Objective

Refactor the complete Markets frontend around the highest-level public Command Center SDK surfaces
that own each lifecycle. This is an application-wide migration: every route, reusable component,
transport adapter, action, theme behavior, iframe boundary, and retained consumer-owned exception
is inventoried below.

The result remains a separately deployed, project-owned static-site application rendered in a
Command Center iframe. It does not become a Command Center source extension, workspace document,
or widget package.

## Full Application Inventory And Target Surface

### Routes

| Route family | Current count | Target SDK surface | Consumer responsibility |
| --- | ---: | --- | --- |
| Resource collections | 12 | `ResourceListPage` | route, resource metadata, API adapter, navigation |
| Resource entities | 12 | `ResourceDetailShell` + `EntitySummary` | UID route state, mutations, domain tab content |
| Related collections in entity tabs | 10 | embedded `ResourceListPage` | scoped endpoint and row metadata |
| Pricing Market Data overview | 1 | `ResourceDetailShell` + two embedded `ResourceListPage` tabs | singleton query and tab routing |
| Settings/API metadata | 1 | `ResourceDetailShell` + `EntitySummary` | exact API-origin context and documentation links |
| Root redirect | 1 | no SDK equivalent | same-origin History API routing |
| Not found | 1 | no SDK equivalent | product-specific recovery copy and link |

### Infrastructure And Components

| Area | Target ownership |
| --- | --- |
| Resource definition validation | SDK `defineResourceApplication` |
| List/detail/create/update/delete/action transport | SDK `ResourceAdapter` backed by `createHttpResourceAdapter` and the app HTTP client |
| Pagination/search/filters/sort/selection/refresh | SDK `ResourceListPage` |
| Bulk action selection/confirmation/execution/cleanup | SDK resource bulk-action lifecycle |
| Breadcrumbs/summary/action placement/tabs/loading shell | SDK `ResourceDetailShell` and `EntitySummary` |
| Theme presets, variables, fonts, density, surfaces | SDK `/theme` and packaged CSS |
| Child iframe handshake | SDK `createStaticSiteIframeClient` |
| Host iframe handshake | Command Center `StaticSiteIframe`; outside this repository |
| Product shell/navigation/router | consumer-owned; the installed SDK has no application-shell or router surface |
| JSON request editor | consumer-owned; the installed SDK has no generic CRUD form/editor contract |
| Arbitrary financial payload rendering | consumer-owned tab content inside SDK shells |
| Exact API origin, cookies, CORS, operation IDs | consumer-owned transport/security boundary |

## Surface Decisions

1. Use `ResourceListPage` for every paginated or refreshable object collection, including related
   collections nested in detail experiences. Do not retain a parallel application table, filter,
   selection, pagination, loading, or empty-state lifecycle.
2. Use `ResourceDetailShell` for every one-object or singleton route that needs standard header,
   summary, action, tab, loading, or error composition.
3. Use `EntitySummary` models containing presentation data and semantic identity only. Routes,
   endpoints, and authentication never enter summary models.
4. Use `createHttpResourceAdapter` for conventional list/get transport. Implement the SDK adapter's
   optional create, update, delete, bulk, and domain-action methods around the existing API when
   their endpoint shapes are not expressible by the HTTP helper.
5. Use application action declarations only to choose consumer-owned primary/header controls.
   Bulk-selection execution stays inside the SDK lifecycle.
6. Keep one stable string UID through list identity, selection, activation, detail lookup,
   mutations, and navigation.
7. Use `createStaticSiteIframeClient` only for the project-owned static-site protocol. Do not mix it
   with `command-center-iframe@v1` widget messages.
8. Keep the app shell and History API router because this SDK version exports no shell or router.
   Keeping them is an explicit boundary decision, not an unreviewed omission.

## Compatibility And Security Constraints

- Preserve all accepted route paths and OpenAPI operation IDs.
- Preserve `mainsequence.markets`, protocol version `1`, and exact configured parent origin.
- Consume only SDK-normalized `themeId`, `themeMode`, and optional `userUid` iframe context.
- Treat `userUid` as untrusted display/routing context; authenticate API requests independently
  through the browser gateway with `credentials: include`.
- Never send navigation, resize, session objects, JWTs, cookies, auth headers, display names,
  organizations, permissions, or backend credentials through iframe context.
- Keep host launch-URL issuance, exchange tokens, authorization, `frame-src`, timeout, and sandbox
  policy outside this repository. The host must use `StaticSiteIframe`.
- Make no backend, persistence, OpenAPI, launch-token, CSP, cookie, or storage contract change.

## Implementation Plan

### Phase 1 — Package, theme, and runtime boundary

- keep the SDK as an editable direct dependency;
- deduplicate React and ReactDOM across its symlink;
- load SDK view/theme/font CSS once;
- apply known presets through `/theme` and fall back deterministically by mode; and
- remove the legacy direct theme package.

### Phase 2 — Canonical resource application adapters

- validate every mapped application through `defineResourceApplication`;
- normalize page index/size, search, scalar filters, server ordering, abort signals, and authoritative
  next/previous/total state;
- implement optional get/create/update/delete and domain-action adapter methods;
- expose only declared explicit-selection bulk endpoints and serialize canonical UID selection; and
- contract-test request mapping, response normalization, identity, CRUD, actions, and bulk behavior.

### Phase 3 — Top-level resource routes

- render all 12 registries through `ResourceListPage`;
- route activation through semantic resource intents and an injected navigation adapter;
- place create operations in `primaryActions`;
- use SDK collection controls and remove the former custom table/filter/pagination infrastructure;
- render all 12 entity routes through `ResourceDetailShell` and `EntitySummary`; and
- place edit, delete, and domain operations in `headerActions` with consumer-owned execution.

### Phase 4 — Related collections and domain tabs

- classify each related endpoint as collection or non-collection from the pinned OpenAPI contract;
- render array, paginated, and `results`-wrapped related collections through embedded
  `ResourceListPage` with stable scoped identity and declared columns;
- keep summaries, snapshots, delete-impact payloads, and tabular-frame payloads as consumer-owned
  content inside the SDK detail shell; and
- preserve operation IDs and abort behavior for every tab query.

### Phase 5 — Singleton application routes

- migrate Pricing Market Data to `ResourceDetailShell` with a normalized summary, overview tab, and
  embedded Market Data Sets and Concept Bindings collection tabs;
- migrate Settings to `ResourceDetailShell` and `EntitySummary` with controlled overview,
  documentation, and API metadata tabs; and
- remove the now-unused custom `PageHeader` component and corresponding CSS.

### Phase 6 — Static-site iframe integration

- install the listener before `announceReady()`;
- let the SDK validate origin, source, channel, version, payload, and normalized context;
- process repeated and anonymous context updates;
- dispose the client and remove the listener on permanent unmount; and
- browser-test a real exact-origin parent/child exchange.

### Phase 7 — Cleanup, documentation, and verification

- remove unused route/search helpers, custom resource CSS, components, imports, and legacy messages;
- align architecture, security, API, local-development, deployment, changelog, and README content;
- verify no application-owned SDK lifecycle remains in parallel; and
- run API drift, typecheck, lint, unit, production-build, audit, and browser gates.

## Acceptance Criteria

1. Every route and reusable frontend component is present in the inventory with an SDK surface or a
   documented reason to remain consumer-owned.
2. All top-level and related object collections use `ResourceListPage`.
3. All entity and singleton object experiences use `ResourceDetailShell`; entity-like summaries use
   `EntitySummary`.
4. The normalized adapter owns list/get/create/update/delete/domain-action/bulk transport mapping.
5. No application code recreates SDK collection tables, filters, sorting, pagination, selection,
   bulk confirmation, detail breadcrumbs, detail tabs, or entity-summary chrome.
6. No application code parses the static-site iframe wire payload.
7. Existing routes, operation IDs, API-origin validation, and gateway authentication are preserved.
8. Known and unknown host themes work; the editable dependency produces one browser React runtime.
9. Backend, launch-token, CSP policy, sandbox capabilities, OpenAPI, and storage contracts remain
   unchanged.
10. API drift, typecheck, lint, unit, build, audit, standalone E2E, direct-route E2E, and iframe E2E
    all pass.

## Rollback

Restore the previous frontend artifact or revert the application commit. No backend or persisted
data rollback is required. Either frontend version still requires the exact parent origin,
`frame-ancestors` allowlist, independently authenticated API, and a compatible version-one host.

## Execution Record

All seven phases were implemented across the complete frontend scope.

- The editable SDK is installed as the direct `0.1.2` dependency and resolves to the local
  `command-center-sdk/command-center-sdk` checkout. React and ReactDOM resolve to one deduplicated
  `19.2.7` runtime.
- All 12 top-level registries use `ResourceListPage`; all 12 entity routes use
  `ResourceDetailShell` and `EntitySummary`.
- Ten related collection operations now use scoped embedded `ResourceListPage` applications.
  Their parent UIDs are encoded into collision-safe SDK contribution identifiers.
- Pricing Market Data and Settings now use SDK detail composition instead of application-owned page
  headers and panels.
- The normalized adapter owns list, get, create, update, delete, detail-action, and explicit bulk
  transport. Camel-case OpenAPI operation IDs remain transport metadata while SDK action IDs are
  canonical lowercase identifiers.
- The SDK owns themes and the version-one static-site iframe handshake. Product routing, the shell,
  JSON mutation editor, and arbitrary financial payloads remain consumer-owned for the reasons in
  the inventory.
- Obsolete page-header code, parallel resource UI, legacy theme dependency, legacy iframe messages,
  stale router state, and corresponding CSS were removed.

### Verification evidence

| Gate | Result |
| --- | --- |
| Generated OpenAPI drift | passed; pinned 128-operation contract matches generated types |
| TypeScript | passed |
| ESLint | passed |
| Unit/component tests | 26 passed across 7 files |
| Production build | passed; Vite transformed 3,440 modules |
| Dependency audit | passed; 0 vulnerabilities in offline audit |
| Browser E2E | 6 passed, covering standalone list, direct detail route, related collection, Pricing Market Data, Settings, and exact-origin iframe initialization |

The refactor did not change backend code, OpenAPI, persistence, launch tokens, host CSP, iframe
sandbox policy, API CORS, cookies, or storage contracts.
