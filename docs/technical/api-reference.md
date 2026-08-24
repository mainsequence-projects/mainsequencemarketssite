# API reference

The API reference is generated from the reviewed
[Main Sequence Markets OpenAPI contract](contracts/mainsequencemarkets-openapi.json) and built into
this Docusaurus site. It documents every public operation, parameter, request body, response, and
schema exposed by `apps/v1`.

- [Browse the generated operations](/docs/technical/api-reference/asset/)
- [Open the API source repository](https://github.com/mainsequence-projects/MainSequenceMarkets)
- [Review how the contract is pinned](api-contract.md)

## Contract ownership

FastAPI and Pydantic in the API repository are the only authored HTTP-contract source. This static
site stores a reviewed OpenAPI snapshot so a documentation build is deterministic and cannot drift
to a different deployed release. Generated MDX is recreated during `docs:dev` and `build:docs`; it
is not maintained or committed as a second specification.

## Read-only reference

The request-send control is disabled. Production Markets traffic uses the Command Center SDK's
delegated FastAPI transport, which a generic OpenAPI console cannot reproduce safely. The reference
therefore shows request and response contracts without collecting credentials or issuing requests.
