# Master List

**Location:** Assets → Reference Data → Master List

Master List is the canonical asset registry. It is the starting point for finding the identity used
by pricing, portfolios, indices, accounts, and published market data.

## What the list shows

The list shows the asset identifier, asset type, and UID. Use search to find an asset and select a
row to inspect it.

## Detail view

- **Overview** shows the complete asset identity record.
- **Summary** presents the canonical human-readable summary.
- **Pricing details** shows pricing-specific attributes associated with the asset.
- **Related MetaTables** lists the tables connected to the asset and their relationship or deletion
  behavior.

## Available actions

The surface supports deleting an asset identity. It does not create or edit assets. Before deleting
an asset, inspect its related MetaTables and confirm that downstream references are understood;
deletion cannot be undone from the site.
