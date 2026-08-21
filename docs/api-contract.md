# API contract

The pinned browser contract is [mainsequencemarkets-openapi.json](contracts/mainsequencemarkets-openapi.json).
It contains 128 operations from the `apps/v1` FastAPI application inspected on 2026-07-31.

Generated TypeScript lives at `frontend/src/lib/api/generated.ts`. Resource definitions use
`keyof operations`, so misspelled or removed operation IDs fail type checking.

## Updating the contract

1. Obtain `/openapi.json` from the intended compatible `mainsequencemarkets` API release.
2. Review the diff, especially routes, request bodies, required fields, responses, and operation IDs.
3. Replace `docs/contracts/mainsequencemarkets-openapi.json` with the reviewed artifact.
4. Run `npm run api:generate` from `frontend/`.
5. Run all verification commands.
6. Update the route compatibility table and changelog for intentional changes.

Runtime code must not generate the contract by importing another repository checkout.

## Command Center bulk-action handoff

The frontend is ready for backend-owned bulk-action discovery on these resource boundaries:

| Resource | Discovery endpoint | Existing execution capability |
| --- | --- | --- |
| Asset Categories | `GET /api/v1/asset-category/bulk-actions/` | `POST /api/v1/asset-category/bulk-delete/` |
| Portfolios | `GET /api/v1/portfolio/bulk-actions/` | `POST /api/v1/portfolio/bulk-delete/` |
| Portfolio Groups | `GET /api/v1/portfolio-group/bulk-actions/` | `POST /api/v1/portfolio-group/bulk-delete/` |

Discovery responses must conform to `command-center.bulk_action_discovery@v1`. Advertised execution
endpoints receive `command-center.bulk_action_execution@v1`. If an action advertises
`preflight_endpoint`, that endpoint receives the same execution payload and returns
`command-center.bulk_action_preflight@v1`. The canonical schemas and fixtures are resolved from the
installed `@dev-mainsequence/command-center-sdk/contracts/manifest.json`; they are not copied here.

The discovery request carries the current semantic `search` and resource filters. It never carries
pagination or presentation-only sorting. The backend must discover and reauthorize actions for the
caller, advertise `explicit` and/or `all_matching` honestly, preserve options and selection meaning,
and authorize preflight and execution independently. Initially advertising only `explicit` is
compatible with the current three delete operations. Existing execution endpoints must accept the
published `{ selection, options }` payload rather than the previous frontend-specific `{ uids }`
shape.

These discovery and possible preflight endpoints are the assumed next backend contract and are not
yet present in the pinned 128-operation OpenAPI artifact. When the backend release is available,
refresh the pinned OpenAPI document and generated types before deployment.

## Authentication

Standalone authentication is performed by the deployed browser gateway and uses
`credentials: include`. Embedded requests call the configured FastAPI ResourceRelease through the
SDK `fetchFastApi` transport. The host resolves a narrow, short-lived delegated credential, while
the SDK owns acquisition, refresh, retry, cancellation, headers, and in-memory cleanup. Application
code never parses credential messages, constructs an authorization header, persists a token, or
falls back to a general platform session credential. Transport lifecycle and 401/403/404/runtime
states are surfaced through the SDK status contract.
