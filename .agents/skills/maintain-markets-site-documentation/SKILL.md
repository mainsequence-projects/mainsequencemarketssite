---
name: maintain-markets-site-documentation
description: Maintain the Main Sequence Markets static-site documentation split between human-facing docs/surfaces and developer/operator docs/technical. Use when adding, changing, renaming, reorganizing, or reviewing navigation destinations, views, actions, API integration, security, development, deployment, OpenAPI artifacts, documentation links, or changelog entries in this repository.
---

# Maintain Markets Site Documentation

## Preserve The Audience Split

Keep all documentation in one of two sections:

- `docs/surfaces/` explains the application to people using it.
- `docs/technical/` explains implementation and operation to developers and operators.

Keep `docs/SUMMARY.md` as the complete documentation map. Keep the root `README.md` limited to the
two primary documentation entry points and essential project information.

Do not place additional Markdown documents directly under `docs/`.

## Use The Application As The Source Of Truth

Before changing surface documentation, inspect:

- `src/app/app-shell.tsx` for navigation labels, hierarchy, order, and default destinations.
- `src/app/router.tsx` for user-facing routes and special views.
- `src/features/resources/resource-definitions.ts` for columns, detail tabs, and available actions.
- `src/features/resources/resource-list-page.tsx` for shared list behavior.
- `src/features/resources/resource-detail-page.tsx` for shared detail behavior.
- The owning feature component for special surfaces such as Pricing Market Data or API Diagnostics.

Document verified behavior only. Do not infer capabilities from an endpoint name, implementation
plan, or stale API description.

## Mirror The Left Navigation

Make the `docs/surfaces/` hierarchy match the left navigation:

1. Give each navigation application a folder and `index.md`.
2. Give each sub-application a nested folder and `index.md`.
3. Give each destination one Markdown page in navigation order.
4. Use lowercase kebab-case folder and file names.
5. Keep the same human-facing labels in headings and `docs/SUMMARY.md`.
6. Update documentation in the same change whenever navigation is added, removed, renamed,
   reordered, or moved.

Document destinations reachable from the left menu. Describe internal tabs, related collections,
and nested detail routes inside the owning destination page instead of inventing additional
navigation destinations.

## Write Human-Facing Surface Pages

Start each destination page with:

```markdown
# Destination Name

**Location:** Application → Sub-application → Destination
```

Then explain, where applicable:

- why a person uses the surface;
- what the list or landing view shows;
- how search, refresh, pagination, and row selection behave;
- which detail tabs are available;
- which create, edit, query, or destructive actions are available;
- important distinctions between similar actions;
- limits, safety considerations, and read-only behavior.

Use product language rather than API implementation language. Mention operation identifiers or
transport details only when they are visible and useful to the person using the view.

Never claim that a mutation is reversible when the application provides no recovery workflow.

## Write Technical Documentation

Keep these topics under `docs/technical/`:

- frontend architecture;
- local development and debugging;
- API and Command Center contracts;
- route compatibility;
- embedding and security;
- deployment and rollback;
- the pinned OpenAPI artifact;
- implementation plans;
- the changelog.

Keep the pinned OpenAPI document under:

`docs/technical/contracts/mainsequencemarkets-openapi.json`

The canonical API source repository is:

`https://github.com/mainsequence-projects/MainSequenceMarkets`

The Docusaurus API reference under `/docs/technical/api-reference/` is generated from the pinned
document. Never edit, review, or commit files under `docs/technical/api-reference/` as authored
documentation. Update the FastAPI/Pydantic source in the API repository, export and review the
pinned OpenAPI JSON, and regenerate the reference with:

```bash
npm run docs:api:generate
```

The generator must read the pinned local JSON. Do not fetch a live deployment during static-site
builds and do not import a sibling repository into browser or deployment code. Keep the OpenAPI
request-send control disabled because production uses the Command Center SDK delegated FastAPI
transport.

When moving or renaming it, update every generator and validation path, including `package.json`
and `scripts/check-generated-api.mjs`.

Technical documentation may use exact paths, operation identifiers, protocol names,
environment-variable names, and release terminology. Link to a surface page instead of duplicating
its human workflow.

## Maintain Navigation And Entry Points

For every documentation change:

1. Update `docs/SUMMARY.md`.
2. Preserve the exact surface hierarchy and order from `app-shell.tsx`.
3. Update `README.md` when a primary entry point or documentation boundary changes.
4. Update `docs/technical/changelog.md` for user-facing, maintainer-relevant, or structural changes.
5. Repair all relative links after moving a page.
6. Remove obsolete paths instead of maintaining duplicate documentation trees.

## Validate

Always run:

```bash
node .agents/skills/maintain-markets-site-documentation/scripts/validate-docs.mjs
git diff --check
```

The documentation validator verifies:

- every local Markdown link resolves;
- every Markdown page under `docs/surfaces/` and `docs/technical/` is represented in
  `docs/SUMMARY.md`;
- no Markdown page other than `SUMMARY.md` exists directly under `docs/`;
- both top-level documentation sections exist.

When the OpenAPI artifact, its location, or generation tooling changes, also run:

```bash
npm run api:check
npm run docs:api:generate
```

When application source, navigation, build configuration, or executable tooling changes, also run:

```bash
npm run lint
npm test
npm run build
```

## Report Completion

Report:

- which surface and technical pages changed;
- which application source files established the documented behavior;
- whether `SUMMARY.md`, `README.md`, and the changelog were updated;
- which validation commands passed;
- any intentionally skipped validation and the exact reason.

Do not commit, tag, synchronize, or deploy unless the user explicitly requests it.
