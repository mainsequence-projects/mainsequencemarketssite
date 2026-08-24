# Asset Categories

**Location:** Assets → Reference Data → Asset Categories

Asset Categories maintains the taxonomy used to group assets across Markets workflows. Use it when
people need stable, named collections such as an asset class, strategy universe, or operational
grouping.

## What a category means

A category is not an Asset Type and does not change Asset identity. It is a named resource with:

- a stable unique identifier;
- a display name;
- an optional description and metadata;
- a membership set containing zero or more Asset UIDs.

Membership is many-to-many: one category can contain many Assets, and one Asset can belong to many
categories. Removing membership leaves both the category and Asset intact. Deleting a category
removes the grouping and its membership rows; it does not delete the Assets that were members.

## What the list shows

The list shows each category's name, unique identifier, description, and UID. Search is available,
and refresh requests the current collection from the API.

## Available actions

- **Create category** creates a category and can assign an initial set of assets.
- Selecting a row opens the category detail.
- **Edit category** changes its display fields or asset membership.
- **Delete category** removes the category.

Create and edit dialogs provide a JSON body. On creation, the service can derive a stable identifier
from the display name when one is omitted. Supplying `assets` establishes the complete membership
set. During an update, omitting `assets` preserves membership, while an empty array intentionally
removes every member.

Keep the unique identifier stable once other workflows refer to it, and review membership before
submitting a replacement. Deletion is permanent from this application.

For exact payloads and responses, use the generated [Asset Category API
reference](/docs/technical/api-reference/asset-category/).
