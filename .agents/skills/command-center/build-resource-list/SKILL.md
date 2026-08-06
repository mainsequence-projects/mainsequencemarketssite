---
name: build-resource-list
description: Build or migrate an object collection with ResourceListPage from @dev-mainsequence/command-center-sdk/views. Use for paginated or refreshable lists, search, declared filters, server sorting, table or card presentation, row activation, selection, common actions, bulk actions, and standard loading, empty, no-results, and error states.
---

# Build A Resource List

## Use The List Framework By Default

Use `ResourceListPage` when the screen represents a collection of domain objects and needs any
combination of pagination, search, filters, sorting, refresh, actions, selection, activation, or
standard async states. This remains true when the visual presentation is cards instead of rows.

Use `embedded` for the same collection lifecycle inside another SDK composition. Use `DataTable`
directly only for a bounded presentation table that does not need the page-level collection
lifecycle.

## Read The Exact Contract

Inspect the installed `/resource` and `/views` declarations, `ResourceListPageProps`, and relevant
tests. Do not infer props from another SDK version.

## Compose The Collection

1. Define the resource with a stable id, label, `getId`, typed columns, and normalized adapter.
2. Supply authoritative page information from the adapter. Never infer a server total from loaded
   rows.
3. Declare searchable, filterable, and sortable behavior through supported definitions and adapter
   requests.
4. Add frontend primary actions through structured declarations in the page-header region.
5. Add row actions through supported row-action contracts.
6. Route selection and discovered bulk actions through `$add-resource-actions`.
7. Use `renderCard` only to change collection presentation, not collection lifecycle.
8. Use a resource activation adapter to resolve semantic `{ resource, uid }` intents and inject
   host navigation separately.

## Do Not Rebuild Owned Behavior

Do not create a parallel page header, toolbar, search row, result counter, selection bar, action
button strip, pagination footer, confirmation flow, or custom collection loading state. Do not use
a native select or bespoke dropdown for SDK-owned list filters.

Use narrow cell renderers and supported contribution points for domain presentation. Keep endpoint
paths, route state, authentication, and query caching outside the SDK definition.

## Verify

Test loading, error, empty, no-results, pagination, search, filters, sort, refresh, selection,
activation cancellation, table/card rendering, and action refresh. Confirm the screen is a thin
resource definition and controller around `ResourceListPage`.
