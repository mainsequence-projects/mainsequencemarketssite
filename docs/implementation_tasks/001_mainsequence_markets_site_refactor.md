# 001. MainSequence Markets Site Refactor Implementation Plan

- **Status:** in progress — site milestone implemented and Command Center product source removed
- **Planning date:** 2026-07-31
- **Primary repository:** `mainsequencemarketssite`
- **Coordinated repositories:**
  - `/Users/jose/code/MainSequenceClientSide/CommandCenter`
  - `/Users/jose/mainsequence-dev/main-sequence-workbench/projects/mainsequencemarkets-21f6783c-041a-4631-80ef-934e1dfa3d2b`
  - a new repository for `@dev-mainsequence/mainsequence-markets-widgets`
- **Reference application:** Mexico Fund Competition

## Outcome

Build the full MainSequence Markets Vite application in this repository, publish the five Markets
widgets from an independent npm package repository, and remove all Markets product logic from
Command Center. The application and widgets consume stable APIs from `mainsequencemarkets`; they do
not import code from each other's repository checkouts.

## Current Implementation Status

Implemented in this repository:

- production Vite/React/TypeScript application and responsive app-owned shell;
- accepted Markets list/detail route families, direct `apps/v1` operations, mutations, and UI states;
- exact-origin API validation with browser-gateway credentials and no iframe credential transport;
- standalone and versioned embedded modes with published Command Center theme presets;
- pinned 128-operation OpenAPI artifact and generated TypeScript operation types;
- lint, typecheck, unit, production build, Playwright, and desktop/mobile browser verification; and
- architecture, contract, security, compatibility, deployment, and rollback documentation.

Implemented in the coordinated Command Center checkout:

- removed the built-in Markets application, pages, routes, settings, permission, mocks, and admin
  surface;
- removed Markets connection bindings, session transport/cache, development proxy, environment
  configuration, and Adapter From API marker authoring;
- removed the five built-in Markets widget implementations, host constants, product-specific frame
  handling, assistant routing, demos tied to the old extension, and source documentation; and
- passed the Command Center negative source scan, architecture/focused tests, full check, production
  build, and documentation build in an isolated copy of the combined working tree.

Implementation decision: the site uses a project-owned History API router instead of React Router.
The published React Router versions available during implementation were covered by high-severity
production advisories; removing the dependency preserved SPA/deep-link behavior and produced a clean
production audit.

Not yet claimed complete:

- authenticated target-platform smoke tests and release evidence;
- creation/publication of the independent five-widget package and any generic host prerequisites
  proven necessary by that package;
- saved-workspace inventory, migration evidence, and cross-repository cutover.

## Success Criteria

The refactor is complete only when all of the following are true:

1. The repository root contains a production Vite SPA with accepted route, action,
   mutation, loading, empty, unauthorized, and error-state parity.
2. The SPA calls a deployed Markets API through one exact configured API origin. It does not use
   Command Center's connection registry, session cache, or Markets proxy.
3. Standalone and embedded modes work. Embedded context carries theme and public display context,
   never authentication credentials.
4. The deployed API resolves authenticated request identity through the supported Main Sequence
   request-context integration and uses an explicit CORS allowlist.
5. One independently published npm package exposes all five widgets through individual subpaths and
   an explicit extension export.
6. Widget package source has no imports from Command Center application source or private Workbench
   modules.
7. Existing widget IDs and compatible props/user-state versions continue to load in persisted
   workspaces, or an approved deterministic migration exists.
8. Command Center passes its normal checks after Markets product pages, transport, settings,
   permissions, routes, demo dependencies, and built-in widget implementations are removed.
9. The intended site and FastAPI project resources/releases point to the intended pushed commits or
   package versions and pass authenticated standalone and embedded smoke tests.
10. Documentation, changelogs, consumer examples, compatibility tables, and rollback procedures are
    aligned in the repositories that own them.

## Scope

### In scope

- a complete Vite React application in this repository;
- a thin project API composition entry point if required for deployment;
- a generated or verified browser client for the Markets OpenAPI contract;
- application shell, routing, themes, embedding, errors, tests, and release documentation;
- migration of all accepted live Markets surfaces and detail flows;
- creation of one independent Markets widget package repository;
- extraction of Asset Screener, Curve Plot, Zero Curve, OHLC Bars, and Position Detail;
- generic Command Center SDK/host prerequisites required by portable widgets;
- Command Center source cleanup and stored-connection marker assessment; and
- platform resource/release cutover and rollback verification.

### Out of scope

- changing financial calculations or storage models solely for the frontend move;
- copying Mexico Fund Competition business features;
- removing the Markets Adapter from API discovery contract;
- removing reusable Python Command Center payload helpers;
- adding new product features during parity migration;
- splitting the five widgets into five repositories; and
- claiming production readiness before authenticated platform verification.

## Current-State Evidence

### Command Center owns Markets product behavior

| Current area | Evidence | Target owner |
| --- | --- | --- |
| Product app and screens | `extensions/main_sequence/extensions/markets/` contains about 35,000 TypeScript/TSX lines | this repository |
| Five Markets widgets | widgets live inside the Markets application extension | widget package repository |
| Market frame contracts | `widget-contracts/marketAssetFrames.ts` is app-local and about 2,800 lines | OpenAPI/versioned widget contracts |
| API helper | `extensions/main_sequence/common/api/index.ts` mixes Workbench and Markets behavior in about 11,300 lines | generated/resource-specific clients |
| API routing | Markets connection transport, bindings, session cache, and development proxy | direct exact-origin client |
| App configuration | extension registry, detail routes, permissions, settings, and assistant context | this repository or deletion |
| Adapter configuration | literal Markets binding types and admin/editor behavior | generic Adapter plus reviewed marker migration |
| Widget identity | Markets constants are exported by a private host | published widget package |

### Existing API boundary

The inspected `apps/v1` OpenAPI document exposes 128 operations covering assets, categories,
indices, calendars, accounts, virtual funds, portfolios, portfolio groups, portfolio signals,
pricing curves, pricing market-data sets, and fixed-income pricing. It also exposes the Adapter from
API discovery document.

The operation count is only inventory evidence. Phase 0 must map every accepted screen action to an
operation ID and record missing behavior. The dormant Command Center `instruments` surface refers
to `/api/v1/instruments-configuration/current/`, which was not present in the inspected OpenAPI and
was not registered as a live Markets surface. It must be deleted or separately approved; it must
not be copied accidentally.

### Widget portability gap

The current widgets depend on private:

- Command Center controls and theme providers;
- dashboard execution and dependency contexts;
- runtime stores and incremental tabular consumers;
- core/pro table renderers and selection models;
- Workbench DataNode source bindings;
- preview, tracing, and toast services; and
- shared API and registry implementation modules.

Each dependency needs a deliberate replacement, public generic host contract, or widget-owned
implementation. Path rewrites alone do not satisfy extraction.

### Reference application

The Mexico Fund Competition frontend demonstrates the project-owned integration shape:

- Vite React SPA and project FastAPI surface;
- exact `VITE_API_BASE_URL` and Command Center parent origin;
- versioned ready/initialize iframe handshake;
- shared Command Center themes;
- Vite, Vitest, ESLint, Playwright, typecheck, and build gates; and
- CSP, CORS, SPA fallback, and iframe security documentation.

Reuse that integration pattern, not its analytics, stores, API types, or navigation.

## Target Repository Shapes

### This repository

```text
mainsequencemarketssite/
├── api/
│   └── app/
│       └── main.py             # thin project composition only
├── package.json
├── package-lock.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── lib/api/
│   ├── lib/embed/
│   ├── lib/runtime/
│   └── themes/
├── tests/
├── docs/
│   └── implementation_tasks/
│       └── 001_mainsequence_markets_site_refactor/
```

The repository root is one application package, not an npm workspace. It does not contain the published
widget package.

### Widget package repository

```text
mainsequence-markets-widgets/
├── package.json                 # one publishable package
├── src/
│   ├── core/                    # host-neutral models and renderers
│   ├── command-center/          # thin public-SDK adapters
│   ├── asset-screener/
│   ├── curve-plot/
│   ├── zero-curve/
│   ├── ohlc-bars/
│   ├── position-detail/
│   └── extension.ts
├── fixtures/
├── tests/
└── examples/
    └── isolated-consumer/
```

## Boundary Rules

1. This repository owns product routes, navigation, page composition, direct API requests, and
   session UI state.
2. `mainsequencemarkets` owns reusable financial/domain logic and the canonical Python API
   contract.
3. The site may import published Python or npm dependencies; it may not import another checkout's
   source through aliases or relative paths.
4. The widget package owns manifests, host-neutral presentation, and public Command Center adapters.
   It does not own authentication, workspace persistence, routing, or connection selection.
5. Command Center may expose generic runtime capabilities. New public capabilities must be
   domain-neutral and useful beyond Markets.
6. TypeScript API types are generated or checked from a pinned OpenAPI artifact. They are not
   maintained manually in several repositories.
7. The iframe UID is display context only. The authenticated gateway establishes identity.
8. No migration phase may introduce a new import from the old Markets extension.

## Phased Implementation

### Phase 0 — Contract, usage, and release inventory

Tasks:

- inventory every live Markets route, detail URL, action, mutation, loading state, and error state;
- export the five widget manifests, IDs, versions, props schemas, state schemas, and sample stored
  instances;
- inspect staging/production workspaces for the five widget IDs;
- map every accepted UI action to an OpenAPI operation ID;
- record API gaps and distinguish missing parity from new feature requests;
- decide whether the dormant Instruments screen is deleted or separately implemented;
- confirm the widget npm scope, registry, repository, and release authority;
- verify the supported static-site discovery/release workflow;
- verify the deployed browser authentication flow; and
- define route deprecation and rollback duration.

Exit gate:

- signed route/action/API matrix;
- saved-workspace usage and migration report;
- accepted widget package identity;
- verified deployment/authentication design; and
- accepted architecture with named repository owners.

Do not delete Command Center source before this gate.

### Phase 1 — Stabilize the reusable API boundary

In `mainsequencemarkets`:

- expose a supported router or application factory that a project entry point can compose;
- keep reusable data access and behavior below the HTTP boundary;
- add supported request-user middleware at application startup;
- define exact environment-driven CORS origins;
- verify all frontend-used operation IDs and error shapes;
- preserve the Adapter from API well-known contract;
- produce a pinned OpenAPI artifact for TypeScript generation; and
- add API compatibility checks for cross-project consumers.

If this repository deploys the API, its `api/app/main.py` must only configure and instantiate the
published API surface.

Authentication gate:

- prove one authenticated read and mutation through the deployed gateway;
- confirm the correct request user is resolved; and
- do not add credentials to the iframe message protocol.

Exit gate:

- route, OpenAPI, Adapter contract, request-user, CORS, and deployed authentication tests pass;
- this repository can pin and instantiate a known API version without source-checkout imports.

### Phase 2 — Release generic Command Center prerequisites

Build a widget-by-widget private-import matrix. Resolve every entry by:

1. consuming an existing published widget SDK/theme contract;
2. implementing domain-specific behavior inside the widget package; or
3. promoting a genuinely generic capability into a public Command Center package.

Likely generic needs include typed runtime inputs/outputs, incremental tabular frames, table
selection outputs, injected execution, and stable widget UI controls. Do not promote Markets API
clients, DataNode assumptions, asset semantics, or portfolio mutations into Command Center.

Exit gate:

- every private dependency has an accepted portable replacement;
- generic Command Center packages pass boundary, package, and consumer tests; and
- required public package versions are released.

### Phase 3 — Create and extract the widget package

Create the independent repository and extract widgets in increasing complexity:

1. Zero Curve.
2. Curve Plot.
3. OHLC Bars.
4. Asset Screener.
5. Position Detail.

For each widget:

- retain the exact canonical widget ID;
- retain or deterministically migrate widget, props, and user-state versions;
- expose a JSON-safe manifest and individual package subpath;
- separate host-neutral renderers from Command Center adapters;
- replace private host/runtime/table imports;
- consume documented inputs such as `core.tabular_frame@v1` or explicit Markets contracts;
- inject execution/API capabilities instead of importing auth or connection stores;
- add preview fixtures and behavior tests; and
- verify the packed artifact in an isolated consumer with one React runtime.

Position Detail remains last because it combines registry search, reads, mutations, traces, toasts,
and several position modes.

Exit gate:

- `npm pack` artifacts for all exports compile and render outside the source repositories;
- persisted fixtures normalize and render;
- no private Command Center/Workbench import or source alias remains; and
- one explicit extension export composes all five widgets without auto-activation.

### Phase 4 — Scaffold the Vite site

Create one Vite application package with:

- React, TypeScript, React Router, Vitest, ESLint, and Playwright;
- strict typecheck, lint, test, build, and E2E scripts;
- generated/resource-specific API clients;
- shared theme presets and packaged CSS from `@dev-mainsequence/command-center-sdk/theme` with one
  React runtime;
- app-owned shell, registry, grid, summary, dialog, loading, and error components;
- a blocking error for missing or invalid API configuration;
- exact-origin `mainsequence.markets` iframe handshake;
- standalone theme fallback and repeated embedded theme updates;
- CSP/CORS/deep-link documentation; and
- a compound local API-plus-Vite development workflow.

Do not copy the Command Center application shell or private component tree. Rebuild the smaller
Markets-owned shell using public theme tokens and explicit project components.

Exit gate:

- blank shell works standalone and embedded;
- invalid API/parent origins fail closed;
- theme updates and deep routes work; and
- typecheck, lint, unit tests, build, and iframe smoke test pass.

### Phase 5 — Migrate product surfaces by domain slice

Recommended order:

1. Settings, Assets, Asset Categories, and Indices.
2. Calendars.
3. Portfolios, Portfolio Groups, and Portfolio Signals.
4. Accounts and Virtual Funds.
5. Pricing Curves and Pricing Market Data.
6. Cross-feature entity links, confirmations, and complete detail-route parity.

For each slice:

- create route-level feature modules in this repository;
- use generated API models and resource-specific clients;
- preserve stable UID-based routes and request meanings;
- replace private Command Center UI with app-owned components;
- cover list, search, pagination, detail, supported mutations, empty, unauthorized, and API error
  behavior;
- compare payloads and visible behavior against the old application; and
- update site-owned documentation.

A screen is not complete merely because it renders. Every accepted mutation and failure state must
pass its parity checklist.

Exit gate per slice:

- signed route/action/API checklist;
- focused frontend and backend contract tests pass; and
- no import from the old Command Center Markets extension.

### Phase 6 — Deploy, shadow, and cut over

Tasks:

- push the intended commits and publish/pin the intended package versions;
- build or select project images for the API/site resources;
- verify FastAPI and static-site project-resource discovery;
- create pinned initial releases with automatic deployment disabled;
- configure exact CORS and reciprocal iframe origins;
- verify SPA fallback for every route family;
- run the new site beside the old extension against equivalent data;
- compare critical list counts, details, mutations, and errors;
- install the external widget package before removing built-in widget code when saved workspaces
  require continuity; and
- retain the old release for the agreed rollback window.

Enable automatic deployment only after repository synchronization, resource paths, contract
checks, and rollback behavior are stable.

Exit gate:

- standalone and embedded production-like E2E pass;
- authenticated reads and mutations pass;
- active saved workspaces render or have an approved migration; and
- rollback to the previous release is tested.

### Phase 7 — Remove Markets logic from Command Center

Delete or replace:

- `extensions/main_sequence/extensions/markets/`;
- Markets connection transport, connection bindings, and session cache;
- Markets functions/types from the shared API module and mocks;
- `VITE_DEBUG_MAIN_SEQUENCE` and the Markets development proxy;
- Markets extension registration, routes, and detail imports;
- Markets permissions, mock access, settings, and admin page;
- literal Markets Adapter editor controls and examples;
- built-in Markets widget source and private host constants;
- Markets-specific assistant routing; and
- demos and documentation tied to the old extension.

Assess stored configuration separately:

- stop authoring Markets `applicationBindings` markers;
- inventory stored markers;
- preserve unknown configuration fields;
- remove only the reviewed exact marker through migration or administrator cleanup; and
- coordinate any backend permission-catalog cleanup outside the frontend repository.

Prefer generic package/deployment composition. Do not add another hardcoded Markets source folder
to Command Center.

Exit gate:

- Command Center checks and build pass;
- a negative source scan finds no Markets product/transport/permission implementation outside
  approved migration notes or package-composition metadata; and
- generic apps, workspaces, connections, themes, and static-site hosting pass regressions.

### Phase 8 — Documentation and release maintenance

In this repository:

- add frontend architecture, local development, API generation, embedding, security, and deployment
  documentation;
- keep this task record current until completion;
- document route compatibility and rollback procedures; and
- update README, documentation navigation, and changelog.

In the widget repository:

- document every export, input/output contract, host capability, and compatibility range;
- maintain an isolated consumer example; and
- publish migration notes and changelog entries.

In `mainsequencemarkets`:

- document only the reusable API/app-factory contract and consumer compatibility;
- do not copy this frontend refactor plan back into that repository.

In Command Center:

- document generic external package composition;
- supersede old embedded Markets application/binding decisions; and
- keep static-site and widget-host documentation domain-neutral.

Exit gate:

- available strict documentation builds pass;
- examples compile from packed/published artifacts; and
- changelogs accurately describe ownership and compatibility impact.

## Cross-Repository Change Sequence

Keep changes independently reviewable:

1. `mainsequencemarkets`: stable API composition and OpenAPI artifact.
2. Command Center: generic public runtime/package prerequisites only.
3. Widget repository: package scaffold, contracts, simple widgets, then complex widgets.
4. This repository: Vite shell, embed/theme integration, generated client, auth/CORS tests.
5. This repository: one product-domain slice per change set.
6. Widget publication and optional Command Center package composition.
7. Site/API deployment and navigation cutover.
8. Command Center deletion of built-in Markets product behavior.
9. Expired redirects/markers, final docs, changelogs, and negative boundary tests.

Do not combine first extraction, production cutover, and source deletion in one change set.

## Validation Matrix

### Site frontend

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Also require:

- invalid API and parent-origin tests;
- standalone and iframe theme tests;
- deep-route/static-host tests;
- route/action/API parity tests; and
- generated-client/OpenAPI drift tests.

### Widget package

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm pack
```

Install the tarball into a clean consumer and verify:

- every subpath export resolves;
- every widget renders with fixtures;
- one React/React DOM runtime is present;
- no source path or unpublished dependency is resolved; and
- exact widget IDs and versions are emitted.

### FastAPI

Run the focused `mainsequencemarkets` API suite plus this project's composition tests. Assert:

- request-bound user context;
- exact CORS preflights and required mutation methods;
- all site-used operations exist in OpenAPI;
- all public operations remain in Adapter discovery; and
- response and error compatibility for migrated actions.

### Command Center

```bash
npm run boundaries:check
npm run public-packages:validate
npm run platform-packages:check
npm run platform-packages:test
npm run test:architecture
npm run check
npm run build
```

Add negative tests rejecting Markets application, API-binding, proxy, router, permission, and
built-in widget implementation source.

### Platform verification

Before making release claims, authenticate and verify:

```bash
mainsequence project current --debug
mainsequence project refresh_token --path .
mainsequence project images list
mainsequence project project_resource list
```

Capture evidence that:

- resources are discovered from the intended pushed commit;
- releases point to the intended image/resource/package versions;
- exact CSP/CORS origins are active;
- embedded deep links and repeated theme updates work;
- authenticated reads and mutations resolve the correct user; and
- automatic deployment is intentionally configured and inspected.

The public documentation describes the image/resource/release model for FastAPI. Confirm the
supported static-site creation workflow against the authenticated target platform before executing
it; do not invent a CLI subcommand.

## Risks And Controls

| Risk | Control |
| --- | --- |
| Widget extraction copies private host internals | dependency allowlist and packed isolated consumer |
| Existing workspaces lose widgets | preserve IDs/versions, inspect usage, install package before source removal |
| Browser identity is confused with iframe UID | deployed gateway proof; no credentials in iframe context |
| Deep links fail in static hosting | SPA fallback test for every route family |
| CSP/CORS only works locally | inspect deployed response and preflight headers |
| API drift breaks one slice | OpenAPI/action matrix and generated-client drift gate |
| Connection cleanup loses unknown fields | reviewed exact-marker migration preserving unknown fields |
| Command Center retains hidden Markets coupling | negative source and architecture tests |
| React/chart/grid runtimes conflict | peer policy and packed-consumer dependency inspection |
| Cross-repository versions become ambiguous | compatibility matrix and pinned release evidence |
| Big-bang cutover is hard to roll back | dual run, per-slice parity, pinned releases, tested rollback |

## Decisions Required In Phase 0

1. Final npm scope, package name, registry, and widget repository location.
2. Whether every active saved Markets widget workspace must be preserved at first cutover.
3. Supported platform workflow for this project's static-site resource and release.
4. Authenticated gateway/cookie/header flow used by the deployed browser API calls.
5. Old Command Center route redirect and rollback duration.
6. Whether the dormant Instruments configuration feature is deleted or separately approved.
7. Whether this project deploys a thin API composition release or calls a separately deployed
   `mainsequencemarkets` API release.

Recommended defaults:

- publish one widget package with subpath exports;
- preserve active workspace compatibility;
- use pinned manual releases for the first cutover;
- retain one release as the rollback window;
- delete the dormant Instruments surface unless a current owner requires it; and
- prefer a thin project composition entry point when it gives the site an explicit compatible API
  version without duplicating backend behavior.

## Planning-Pass Limitations

The source analysis and public Main Sequence documentation were inspected. Live project-resource,
deployed authentication, workspace usage, and release creation were not verified because the local
CLI session was not authenticated during planning. Those facts remain Phase 0 gates and must not be
reported as complete until captured from the target platform.
