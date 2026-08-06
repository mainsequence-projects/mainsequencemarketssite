---
name: evolve-command-center-contract
description: Change a public, serialized, persisted, or protocol-level contract owned by @dev-mainsequence/command-center-sdk. Use for widget manifests, workspace documents, bindings, runtime updates, value contracts, tabular frames, migrations, canonical IDs, schema versions, theme IDs, embed protocol messages, or backend-serialized SDK data requiring compatibility analysis.
---

# Evolve A Command Center SDK Contract

## Identify The Compatibility Axis

Do not treat the npm package version as the only version. Identify every affected axis:

- npm public API version;
- widget manifest API and widget semantic version;
- workspace schema, widget props, and widget user-state versions;
- value-contract and runtime-update identifiers;
- stable widget, resource, theme, and contribution ids; and
- embed wire-protocol identifier.

Read the installed or source `/contracts`, `/widget`, `/workspace`, `/theme`, and `/embed`
declarations relevant to the change.

## Preserve Existing Data

1. Prefer additive optional fields with deterministic defaults.
2. Preserve unknown JSON fields and unknown canonical ids through normalization and snapshots.
3. Never translate retired ids through undocumented aliases.
4. Keep migrations ordered, deterministic, pure, and independently testable.
5. Defer runtime-specific migration when the required runtime is unavailable.
6. Introduce a new protocol identifier and transition path for breaking wire changes.
7. Document removal or semantic changes as breaking even when TypeScript still compiles.

## Assess Backend Impact

Determine whether a backend stores, validates, filters, publishes, or returns the changed shape. If
yes, produce a backend handoff containing old and new shapes, defaults, version gates, rollout
ordering, rollback behavior, and serializer/validator changes. Do not implement backend code in
this skill.

If the change affects only TypeScript ownership or optional client interpretation while serialized
bytes remain stable, record that no backend contract change is required.

## Verify

Test old payloads, new payloads, unknown fields, missing versions, migration ordering, round trips,
retired ids, downgrade or mixed-version behavior, and protocol rejection. Run
`$verify-command-center-sdk-change` before release.
