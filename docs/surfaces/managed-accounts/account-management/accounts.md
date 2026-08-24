# Accounts

**Location:** Managed Accounts → Account Management → Accounts

Accounts presents managed-account identity and operational position snapshots. Use it to compare
current holdings, virtual-fund allocation, and intended target positions.

## What the list shows

The list shows account name, unique identifier, active status, paper/live classification, and UID.
Search is available.

## Detail view

- **Overview** shows the complete account identity.
- **Summary** presents canonical account status and relationships.
- **Holdings** shows the account holdings snapshot.
- **Holdings by fund** groups account holdings by virtual fund.
- **Target positions** shows the intended position snapshot.

## Available actions

- **Add holdings** adds a dated holdings snapshot or overwrites the same date when explicitly
  requested.
- **Add target positions** adds a dated target-position snapshot or overwrites it when explicitly
  requested.

Both dialogs default `overwrite` to false. Confirm the effective date, instrument identifiers, and
position values before submitting; the surface deliberately does not silently overwrite data.
