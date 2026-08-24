# Assets

**Location:** Assets

Assets is the shared reference layer for the instruments and observables used by pricing,
portfolios, managed accounts, and published market data. The application opens this area on
**Master List** because every downstream workflow needs a stable identity before it can attach
prices, positions, formulas, or other facts.

## The model at a glance

An Asset is deliberately small. It answers one question: **which market object is this?**

| Part | What it owns | What it does not own |
| --- | --- | --- |
| **Asset** | Stable identity: UID, unique identifier, and asset type | Ticker history, prices, bond terms, provider payloads, or portfolio holdings |
| **Asset Type** | Meaning of a classification such as `equity`, `bond`, or `currency_spot` | The fields specific to one instrument |
| **Current Snapshot** | Latest published name, ticker, exchange code, and ticker-group identifier | Permanent identity |
| **Asset Details** | Type- or provider-specific properties linked one-to-one to the Asset | Time-series prices or calculated observations |
| **Pricing Details** | Current serialized pricing instrument and supported pricing operations | The canonical Asset identity |
| **Asset Category** | A named, many-to-many grouping of Assets | A new Asset identity or Asset Type |

This separation prevents a changing ticker, exchange label, or pricing representation from
changing the identity used by portfolios and datasets.

## Asset identity

Every Asset has three canonical fields:

- **UID** is the immutable UUID used by application routes and relational links.
- **Unique identifier** is the stable business identifier used for lookup, idempotent updates, and
  joins from asset-indexed datasets. It is not assumed to be a ticker.
- **Asset type** is a normalized classification key. Its human meaning comes from the Asset Type
  registry; instrument-specific fields do not get added to the Asset row.

For example, a bond remains one Asset identity. Its issuer, currency, issue date, maturity date,
and status belong to the bond detail record linked to that Asset. Pricing terms and observations
remain separate again.

## Reference Data

- [Asset Categories](reference-data/asset-categories.md) explains named groupings and Asset
  membership.
- [Master List](reference-data/master-list.md) explains the canonical Asset row, snapshots,
  details, pricing, and deletion boundaries.
- [Indices](reference-data/indices.md) explains reusable observables, formulas, and datasets. An
  Index is a separate model and is not automatically a tradable Asset.

Developers can use the [generated API reference](/docs/technical/api-reference/) for exact request
and response schemas.
