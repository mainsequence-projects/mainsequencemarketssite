---
name: choose-command-center-surface
description: Choose the authoritative @dev-mainsequence/command-center-sdk surface for a new, rebuilt, or migrated frontend experience. Use before implementing collections, entity details, selectors, dashboards, widgets, themes, or external embeds, especially when deciding whether an existing SDK composition already owns the required lifecycle.
---

# Choose A Command Center SDK Surface

## Inspect Before Choosing

Read the installed SDK export map and declarations. Choose only a capability that exists in that
version. Start from the highest-level composition that owns the required lifecycle.

## Route The Requirement

- Use `$build-resource-list` for a collection of objects with loading, pagination, search, filters,
  sorting, refresh, row activation, cards or tables, or common actions.
- Use `$build-resource-detail` for one identified object with a summary, breadcrumbs, actions,
  tabs, nested tabs, and controlled async states.
- Use `$build-resource-picker` when the interaction selects one or many values or presents a
  searchable action menu.
- Use `$add-resource-actions` when confirmation, selection, preflight, execution, and refresh are
  central to the change.
- Use `$adapt-resource-backend` to normalize an existing API for resource views or to specify the
  frontend contract required from a separate backend task.
- Use `$build-command-center-widget` for one reusable panel that participates in widget IO,
  settings, preview, or runtime behavior.
- Use `$host-command-center-widgets` to compose extensions and executable widget registries.
- Use `$build-command-center-workspace` for a persisted document containing multiple widget
  instances, layouts, and bindings.
- Use `$theme-command-center-app` for tokens, presets, palettes, density, and packaged styles.
- Use `$integrate-static-site-iframe` for a project-owned static site receiving Command Center
  theme and public-user context through the `mainsequence.*` ready/initialize handshake.
- Use `$embed-command-center-app` for an external widget crossing an iframe trust boundary through
  the generic `command-center-iframe@v1` props/inputs/outputs protocol.

## Prefer The Owned Composition

Use `ResourceListPage` rather than assembling a page header, toolbar, search, table, selection,
actions, and pagination independently. Use `ResourceDetailShell` rather than rebuilding summary
and tab chrome. Use `ResourcePicker` rather than creating another dropdown interaction.

Drop to a smaller exported view only when the higher-level lifecycle is genuinely absent. A small,
bounded, presentation-only table may use `DataTable`; a paginated object collection should not.

## Handle Missing Capability

If no public SDK surface fits, decide whether the behavior is reusable and backend-neutral. Keep a
one-off domain experience in the consumer. Route a reusable SDK capability through
`$extend-command-center-sdk`; never patch the installed package.

Record the chosen surface and why nearby alternatives do not fit before implementation.
