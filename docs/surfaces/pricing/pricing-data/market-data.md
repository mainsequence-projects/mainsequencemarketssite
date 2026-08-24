# Market Data

**Location:** Pricing → Pricing Data → Market Data

Market Data manages the governed environments and source bindings used to resolve pricing inputs.

## Overview

The landing summary reports the current pricing market-data status and available counts. Two tabs
organize the configuration:

- **Market Data Sets** contains named pricing environments with a stable set key and lifecycle
  status.
- **Concept Bindings** maps a pricing concept in a set to a DataNode or storage source.

## Market Data Sets

You can create, edit, inspect, and delete a set. A set detail includes its bindings; selecting an
activated binding opens the binding detail. The list shows name, set key, status, description, and
UID.

## Concept Bindings

You can create, edit, inspect, and delete a binding. The list shows concept, set UID, source,
DataNode, and UID. A binding should identify exactly one intended governed source for the concept.

These embedded lists deliberately do not provide text search. Use their stable identifiers and the
browser's page context to confirm the selected set or binding before changing it.
