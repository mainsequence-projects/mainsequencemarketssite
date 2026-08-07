---
name: adapt-resource-backend
description: Adapt an existing backend API to the normalized resource contracts in @dev-mainsequence/command-center-sdk/resource, or prepare the exact frontend contract for a separate backend task. Use for list and detail normalization, authoritative pagination, search, filters, sorting, CRUD adapter methods, bulk-action discovery, preflight, execution, cancellation, and transport ownership.
---

# Adapt A Resource Backend

## Keep This A Frontend Adapter Skill

Do not implement backend services, persistence, authorization, ORM logic, or deployment here. Map
an existing API into the SDK contract, or produce a precise handoff for the backend skill.

## Choose The Adapter Level

- Inspect the installed `contracts/manifest.json` before inventing a backend shape. When an
  endpoint declares a published contract, load only the schema and fixtures indexed by that
  manifest entry. Use `$implement-resource-collection-contract` or
  `$implement-bulk-actions-contract` for backend-side conformance work.
- Use `createHttpResourceAdapter(...)` for conventional HTTP endpoints with explicit response
  normalizers and a host-supplied HTTP client.
- Implement `ResourceAdapter<T, Id, CreateInput, UpdateInput>` for a nonstandard transport or
  lifecycle.

Read the installed `/resource` declarations before deciding. Authentication, base URL, headers,
retry, caching, and session policy belong to the supplied transport, not the SDK adapter.

## Normalize The Contract

1. Map list input to `pageIndex`, `pageSize`, optional search, filters, sort, and abort signal.
2. Return `items` plus authoritative `pageInfo`: page index, page size, total items, next-page, and
   previous-page state.
3. Normalize collection controls and bulk actions only when actually advertised.
4. Keep one stable id type across `getId`, detail, selection, activation, actions, and navigation.
5. Implement optional get, create, update, delete, and action methods only when supported.
6. Forward abort signals and ignore stale results in the owning view lifecycle.
7. Normalize advertised conflict or preflight responses into SDK blocked/allowed models without
   discarding the raw payload.

Do not leak response wrappers, endpoint URLs, authentication objects, or transport errors into
framework-neutral resource definitions.

## Produce A Backend Handoff

When backend work is required, specify:

- canonical resource identity and UID type;
- list request parameters and sort/filter vocabulary;
- list, page-info, and detail response shapes;
- null, not-found, forbidden, validation, conflict, and server-error semantics;
- action discovery, selection, options, preflight, and execution payloads;
- permission and authorization expectations; and
- cancellation, idempotency, and refresh expectations.

Hand that requirement to the appropriate backend contract skill without prescribing its internal
implementation. Reference the exact manifest contract ID and schema `$id`. Use the manifest-indexed
fixtures rather than copying or rewriting them in the handoff. The resource-collection schema is
the normalized adapter boundary; do not force an established raw API envelope to match it when an
explicit frontend normalizer is the intended integration.

## Verify

Contract-test raw backend fixtures against every normalizer. Test pagination edges, empty results,
unknown totals only if supported by the installed contract, abort behavior, identity consistency,
errors, action discovery, preflight, and execution. Validate schema-bound payloads with a
draft-2020-12 validator and require indexed invalid fixtures to fail.
