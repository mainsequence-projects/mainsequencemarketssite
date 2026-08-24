# API contract

The pinned browser contract is [mainsequencemarkets-openapi.json](contracts/mainsequencemarkets-openapi.json).
It contains 158 operations from the `apps/v1` FastAPI application. The contract is authored in the
[Main Sequence Markets API repository](https://github.com/mainsequence-projects/MainSequenceMarkets)
and rendered here as a [generated API reference](api-reference.md).

Generated TypeScript lives at `src/lib/api/generated.ts`. Resource definitions use
`keyof operations`, so misspelled or removed operation IDs fail type checking.

## Updating the contract

1. Obtain `/openapi.json` from the intended compatible `mainsequencemarkets` API release.
2. Review the diff, especially routes, request bodies, required fields, responses, and operation IDs.
3. Replace `docs/technical/contracts/mainsequencemarkets-openapi.json` with the reviewed artifact.
4. Run `npm run api:generate` from the repository root.
5. Run `npm run docs:api:generate` to rebuild the local reference pages.
6. Run all verification commands.
7. Update the route compatibility table and changelog for intentional changes.

Runtime code must not generate the contract by importing another repository checkout.
The deployment build also never fetches `/openapi.json`; it renders only the reviewed pinned file.

## Canonical Command Center collection handoff

Every primary and embedded resource-list endpoint must return the installed SDK contract
`command-center.resource_collection@v1` directly. The frontend does not translate Django-style
`count`/`results` envelopes, bare arrays, or domain-specific list wrappers. The canonical schema
and fixtures are resolved from the installed
`@dev-mainsequence/command-center-sdk/contracts/manifest.json`; they are not copied here.

The collection request uses `limit`, `offset`, optional `search`, declared resource filters, and
`ordering` only when discovery advertises sortable keys. `response_format` is not a frontend
presentation switch. The backend's default collection response must be the canonical contract.

Every collection also exposes `GET {collection-path}/discovery/` and returns
`command-center.resource_discovery@v1`. Discovery owns resource identity, search/filter/ordering
capabilities, ordered visible columns, safe generic value bindings, and authorized `bulk_actions`.
The discovery request carries semantic search and filters but never pagination or current sort
presentation. This applies uniformly to all 25 backend collections. Twelve are primary site
registries, ten are related collections rendered inside detail views, and three remain API-level
picker or relationship collections. The pinned OpenAPI artifact includes every collection and
discovery operation.

Advertised bulk-action endpoints receive `command-center.bulk_action_execution@v1`. If an action
advertises `preflight_endpoint`, that endpoint receives the same execution payload and returns
`command-center.bulk_action_preflight@v1`. The backend must rediscover and reauthorize actions for
the caller, preserve `explicit` and `all_matching` selection semantics, and authorize preflight and
execution independently. Existing execution endpoints must accept the published
`{ selection, options }` payload.

The pinned 158-operation OpenAPI artifact contains the canonical collection and discovery
operations, canonical account and pricing-curve details, and no legacy collection selectors.

## Authentication

Standalone authentication is performed by the deployed browser gateway and uses
`credentials: include`. Embedded requests call the configured FastAPI ResourceRelease through the
SDK `fetchFastApi` transport. The host resolves a narrow, short-lived delegated credential, while
the SDK owns acquisition, refresh, retry, cancellation, headers, and in-memory cleanup. Application
code never parses credential messages, constructs an authorization header, persists a token, or
falls back to a general platform session credential. Transport lifecycle and 401/403/404/runtime
states are surfaced through the SDK status contract.
