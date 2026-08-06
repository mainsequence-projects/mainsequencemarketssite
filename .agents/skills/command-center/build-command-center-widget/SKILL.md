---
name: build-command-center-widget
description: Create, migrate, review, or test a portable widget with @dev-mainsequence/command-center-sdk/widget. Use for choosing a built-in versus custom widget, authoring JSON-safe manifests and executable runtimes, settings, IO ports, preview fixtures, usage guidance, runtime capabilities, widget migrations, or separately distributed widget extensions.
---

# Build A Command Center Widget

## Confirm A Widget Is The Right Surface

Use a widget for a reusable panel with its own props, settings, IO, preview, or runtime behavior. Do
not turn a normal object list, object detail page, or entire top-level routed workflow into a
widget.

Inspect `/widget/built-ins` first. Reuse a built-in when its documented contract fits. Add a generic
built-in to the SDK only through `$extend-command-center-sdk`; keep domain-specific widgets in a
separate extension package.

## Read The Installed Contract

Inspect `/widget`, `/widget/testing`, and the relevant declarations for the installed SDK version.
Use `defineWidgetModule(...)` for new widgets and reserve legacy mixed definitions for migration.

## Author The Module

1. Choose a globally unique `{owner}__{widget}` id and semantic widget version.
2. Keep the manifest JSON-safe and compatible with the declared widget API version.
3. Put components, settings, resolvers, execution hooks, migrations, snapshots, and preview data in
   the executable runtime.
4. Export an explicit extension with stable package identity and provenance.
5. Keep React and React DOM as peers.
6. Import only published SDK entrypoints and deliberate third-party dependencies.

## Document And Preview Real Behavior

Maintain specific `USAGE_GUIDANCE.md` content for purpose, when to use, when not to use, props,
settings, IO, runtime ownership, published values, and constraints. Resolve registry-visible
description and guidance from the documented source.

Provide representative `mockProps` or `exampleProps` and mock runtime state when needed so previews
do not depend on live workspace bindings.

## Treat Persistence As A Contract

Keep manifest identity separate from runtime functions. Use `$evolve-command-center-contract` when
changing props, user state, IO payloads, registry metadata, or version axes.

## Verify

Use `/widget/testing` assertions for manifests and preview fixtures. Test rendering, settings, IO,
capability failures, migrations, guidance resolution, and extension export behavior.
