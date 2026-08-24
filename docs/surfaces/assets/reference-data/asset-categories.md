# Asset Categories

**Location:** Assets → Reference Data → Asset Categories

Asset Categories maintains the taxonomy used to group assets across Markets workflows. Use it when
people need stable, named collections such as an asset class, strategy universe, or operational
grouping.

## What the list shows

The list shows each category's name, unique identifier, description, and UID. Search is available,
and refresh requests the current collection from the API.

## Available actions

- **Create category** creates a category and can assign an initial set of assets.
- Selecting a row opens the category detail.
- **Edit category** changes its display fields or asset membership.
- **Delete category** removes the category.

Create and edit dialogs provide a JSON body. Keep the unique identifier stable once other workflows
refer to it, and review asset membership before submitting an update. Deletion is permanent from
this application.
