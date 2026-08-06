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

## Authentication

Authentication is performed by the deployed browser gateway. The site sends cookies through
`credentials: include`; it does not accept credentials from iframe messages. A 401 or 403 produces
an application access state. The static-site iframe protocol does not transport authentication
state or credentials.
