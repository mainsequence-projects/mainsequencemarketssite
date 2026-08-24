# Indices

**Location:** Assets → Reference Data → Indices

Indices manages index identities and provides visibility into the formulas and datasets behind each
index.

## What an Index means

An Index is a reusable observable, not necessarily a tradable Asset. It has its own stable identity,
business classification, calculation ownership, presentation format, formula lifecycle, and
canonical observations.

- **Index type** is the business classification.
- **Calculation method** is either `formula`, where Markets evaluates a versioned expression, or
  `custom`, where application code publishes values.
- **Value format** controls decimal or percent presentation and does not change stored values.
- **Formula definitions** are immutable versions with validity, exact Asset or Index inputs,
  alignment policy, and missing-data policy.
- **Datasets** are cadence-specific canonical observations keyed by time and Index identifier.

An Index can consume Assets or other Indices as formula inputs, but those relationships do not merge
their identities. A portfolio or strategy can publish a custom Index without becoming part of the
formula engine.

## What the list shows

The list shows name, unique identifier, index type, calculation method, and UID. Search is
available.

## Detail view

- **Overview** shows the Index identity, calculation method, classification, and presentation
  fields.
- **Summary** explains the Index in canonical summary form and reports current availability.
- **Formulas** lists immutable formula versions, status, validity, exact source bindings, alignment,
  missing-data policy, and expression text.
- **Datasets** shows cadence-specific storage, whether it is populated or compatible-but-empty, row
  count, and latest observation.
- **Related MetaTables** shows registered source-selection candidates. Compatibility does not prove
  that the selected Index has rows in each table.
- **Delete impact** reports dependencies that matter before deletion.

## Available actions

- **Create index** registers a new index definition.
- **Edit index** updates mutable display and metadata fields.
- **Delete index** removes the definition when backend constraints allow it.

Review **Delete impact** before deleting an index. The impact view is informational; the separate
delete action performs the actual change.

For exact payloads and responses, use the generated [Index API
reference](/docs/technical/api-reference/index/).
