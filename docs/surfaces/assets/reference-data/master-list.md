# Master List

**Location:** Assets → Reference Data → Master List

Master List is the canonical asset registry. It is the starting point for finding the identity used
by pricing, portfolios, indices, accounts, and published market data.

## What an Asset means

An Asset is the smallest stable identity shared by Markets workflows. The row intentionally
contains only:

| Field | Meaning |
| --- | --- |
| **UID** | Immutable UUID used by detail routes, category membership, and relational references. |
| **Unique identifier** | Stable business key used for lookup, idempotent updates, and joins from asset-indexed data. It is not necessarily a ticker. |
| **Asset type** | Normalized classification key such as `equity`, `bond`, `currency`, or `currency_spot`. |

The Asset Type registry gives an asset-type key its display name and explanation. The classification
does not make every instrument share the same fields.

## Where the other facts live

Facts are kept according to how they change and who owns them:

- **Name, ticker, exchange code, and ticker group** are timestamped snapshot facts. The detail view
  shows the latest published snapshot, but previous facts remain part of the snapshot history.
- **Instrument-specific properties** live in one-to-one detail records linked by Asset UID. A
  currency spot detail links the base and quote currency Assets. A bond detail links the issuer and
  currency and stores issue date, maturity date, and status. Provider identifiers such as FIGI or
  ISIN remain in provider-specific detail records.
- **Pricing representation** is separate from both identity and instrument details. Pricing details
  can include the serialized instrument, valuation support, and available pricing operations.
- **Prices and other observations** live in timestamped datasets keyed by the Asset's stable unique
  identifier. They are not columns on the Asset row.
- **Portfolio positions and account holdings** reference the Asset; they do not become Asset
  properties.

This is why editing a ticker does not create a new Asset, and why adding a bond maturity field does
not widen every Asset record.

## What the list shows

The list shows the unique identifier, asset type, and UID. Search checks identifiers and available
detail fields. Refresh retrieves the current first page from the API; pagination requests another
bounded page. Select a row to inspect the composed detail.

## Detail view

- **Overview** shows the canonical identity together with the latest snapshot and any resolved
  type- or provider-specific detail records. Missing snapshot fields mean no current fact was
  published; they are not invented from the identifier.
- **Summary** presents the identity as reusable labels, badges, fields, and statistics for the
  detail page.
- **Pricing details** shows the current serialized pricing representation and the operations the
  backend declares as supported. A missing pricing record does not mean the Asset identity is
  invalid.
- **Related MetaTables** lists registered tables whose authoritative foreign key targets the
  Asset's stable unique identifier. Compatibility does not prove that this particular Asset already
  has observations in every listed table.

## Available actions

The surface supports deleting an asset identity. It does not create or edit assets. Before deleting
an asset, inspect its related MetaTables and confirm that downstream references are understood;
deletion cannot be undone from the site.

Database constraints decide whether related detail, category-membership, pricing, or dataset rows
block deletion, cascade, or remain separately governed. A successful deletion removes the identity
that downstream workflows reference; it is not merely hiding a row from this list.

## Exact API contracts

The generated technical reference contains the exact schemas and error responses without repeating
them here:

- [List Assets](/docs/technical/api-reference/list-assets/)
- [Get Asset](/docs/technical/api-reference/get-asset/)
- [Get Asset Summary](/docs/technical/api-reference/get-asset-summary/)
- [Get Asset Pricing Details](/docs/technical/api-reference/get-asset-pricing-details/)
- [List Asset Related MetaTables](/docs/technical/api-reference/list-asset-related-meta-tables/)
- [Delete Asset](/docs/technical/api-reference/delete-asset/)
