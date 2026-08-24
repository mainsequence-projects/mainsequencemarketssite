---
slug: /
---

# Application surfaces

This section explains the Markets application from a person's point of view: where each view is,
what information it presents, and which actions are available. Its folders and page order mirror
the left navigation exactly. Open this documentation from the book icon fixed to the bottom of the
Markets application rail.

## Navigation map

- [Assets](assets/index.md)
  - [Reference Data](assets/reference-data/index.md)
    - [Asset Categories](assets/reference-data/asset-categories.md)
    - [Master List](assets/reference-data/master-list.md)
    - [Indices](assets/reference-data/indices.md)
- [Portfolios](portfolios/index.md)
  - [Portfolio Management](portfolios/portfolio-management/index.md)
    - [Portfolios](portfolios/portfolio-management/portfolios.md)
    - [Portfolio Groups](portfolios/portfolio-management/portfolio-groups.md)
    - [Signals](portfolios/portfolio-management/signals.md)
- [Managed Accounts](managed-accounts/index.md)
  - [Account Management](managed-accounts/account-management/index.md)
    - [Accounts](managed-accounts/account-management/accounts.md)
    - [Virtual Funds](managed-accounts/account-management/virtual-funds.md)
- [Pricing](pricing/index.md)
  - [Pricing Data](pricing/pricing-data/index.md)
    - [Curves](pricing/pricing-data/curves.md)
    - [Market Data](pricing/pricing-data/market-data.md)
- [Platform](platform/index.md)
  - [Platform Tools](platform/platform-tools/index.md)
    - [Calendars](platform/platform-tools/calendars.md)
    - [API Diagnostics](platform/platform-tools/api-diagnostics.md)

## Shared interaction pattern

Most destinations open as a paginated list. Use search when it is available, refresh the list to
request current data, and select a row to open its detail view. Detail views begin with an overview
and can add tabs for summaries, related records, or domain-specific information.

Create, edit, query, and destructive actions open a dialog that shows the operation and its
pre-filled JSON input. Review that input before submitting it. Destructive actions are explicitly
marked and cannot be undone from this application.

Loading, empty, error, and retry states are part of every surface. The application never treats a
failed request as a successful change.

For API operations, transport, development, and deployment details, use the
[technical documentation](../technical/index.md).
