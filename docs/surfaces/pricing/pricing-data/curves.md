# Curves

**Location:** Pricing → Pricing Data → Curves

Curves exposes pricing-curve identity, lifecycle status, selected market-data inputs, and resolved
discount-curve nodes.

## What the list shows

The list shows curve name, unique identifier, curve type, currency, status, and UID. Search is
available.

## Detail view

- **Overview** shows the complete curve identity.
- **Summary** presents the canonical curve summary.
- **Selections** lists the selected roles, source, status, quote side, and binding.
- **Delete impact** reports dependencies that matter before deletion.

## Available actions

- **Load discount curve** resolves curve nodes for a valuation date and optional market-data set.
  Its result appears in an **Operation result** tab.
- **Delete curve** removes the curve when backend constraints allow it.

Loading a discount curve is a query and does not mutate the curve. Review **Delete impact** before
using the separate destructive action.
