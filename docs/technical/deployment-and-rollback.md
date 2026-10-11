# Deployment and rollback

## Platform-managed static release

The repository owns two workflow API `2.3.0` declarations under `.mainsequence/workflows/`.
Both files are committed in both branches; the backend applies only the declaration scoped to the
branch's Organization Environment.

| Git branch | Environment | Workflow | Release | FastAPI release |
| --- | --- | --- | --- | --- |
| `development` | development | `static-site-development.yaml` | Main Sequence Markets Development | `markets-api` of `MainSequenceMarkets` in development (`e2f9effd-988d-47bd-a25a-372d4887834b` on 2026-10-11) |
| `main` | Production | `static-site.yaml` | Main Sequence Markets | `markets-api` of `MainSequenceMarkets` in Production (`a9832527-17ae-46b5-9ab5-a429656e08cc` on 2026-10-11) |

The scopes are the Environments' exact names in this backend, `development` and `Production`: the
backend's `validate-workflow` reports `static-site.yaml` applicable only on `main` and
`static-site-development.yaml` only on `development`.

Production requires the exact Git branch `main`. A signed push creates the site's missing
`development` CodeRepositoryBranch because the Organization's development Environment already
requires that exact branch. There is no manual branch registration or environment override.

Each workflow uses `root_directory: ""` for the repository root, Vite on Node.js 24, `dist` output,
SPA routing through `/index.html`, and automatic redeployment for every synchronized commit
(`enabled: true`, `tag_regex: null`). Validate each file with the owning branch's backend
`validate-workflow` action before pushing. Preserve the existing production file path and resource
key: renaming either would replace its release identity.

Develop and push changes on `development`, verify the development site and API together, then
promote the tested code to `main`. Keep both scoped files during promotion. Inspect
repository-event results and DeploymentRuns, and confirm each release's ready active revision
serves the expected commit. An API release with no active revision cannot serve the site even when
the static build succeeds.

Organization Environment names do not select infrastructure hostnames. Treat the backend-returned
site and API URLs as opaque; use the active platform's advertised CORS origins instead of deriving
hostnames from the Git branch.

The workflow's existing npm build produces both surfaces in the same `dist/` output: Vite emits the
Markets application at the root, then Docusaurus emits real static pages under `dist/docs/`. The
platform therefore needs no documentation backend, second release, or additional environment
variable. `/docs/` and its nested routes are served from the same static-site deployment while
retaining Docusaurus's independent layout and navigation.

Before Docusaurus compiles, the build recreates the API operation and schema pages from the
committed OpenAPI snapshot. It does not call the deployed API, and generated MDX is not a second
reviewed source. Updating the reference therefore requires reviewing and committing a new OpenAPI
snapshot first.

The only application-specific browser build input is `VITE_FASTAPI_RELEASE_UID`, which selects the
Main Sequence Markets API release used by the SDK's delegated FastAPI transport. Both workflows name
that API instead of pinning its UID:
`{resource_release: {repository: MainSequenceMarkets, key: markets-api}}`. The platform resolves it
to the API's release UID in the site's own Environment at every build, so each branch gets its
Environment's API, and it rebuilds the site when the API is re-created. The platform owns
and injects the reserved `VITE_COMMAND_CENTER_ORIGIN`; do not commit or derive a Command Center
hostname. The FastAPI release UID is stable across automatic API redeployments; the SDK resolves
the current opaque RPC endpoint and delegated credential at request time. Do not add a copied
runtime URL or a pinned UID to the platform workflow. Build inputs are public and must never
contain credentials.
Both deployed applications are embedded-only. Opening a static release URL outside Command Center
fails closed instead of switching to a direct browser API origin.

The application declares public SDK `0.5.17` from npm. `package-lock.json` records
the resolved artifact and integrity; `npm ci` installs that exact dependency graph.
After a dependency change, run `npx command-center-sdk code-repository sync --path .`
to refresh the lockfile and install it. The command performs no Git or deployment
operation. Commit the reviewed change and push only when publication is authorized.

## Local direct development

Use the VS Code full-stack launcher or Vite development server with a local API origin:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8001 npm run dev -- --port 3010
```

This path is allowed by Vite development mode and is not deployed. The platform workflow publishes
`dist/` as an embedded-only SPA and falls back to `/index.html`. The
Command Center viewer must render the launch URL with the SDK `StaticSiteIframe` host, pass only the
current theme ID/mode plus the optional public user UID, and provide the delegated FastAPI
credential resolver.

## First cutover

1. Pin the intended site commit and API release.
2. Confirm the scoped repository workflow was accepted for the exact target CodeRepositoryBranch.
3. Verify the target FastAPI release admits the deployed static-site origin and that delegated GET,
   POST, PATCH, and DELETE requests succeed.
4. Smoke-test embedded reads and mutations through delegated `fetchFastApi` transport.
5. Verify backend bulk discovery, optional preflight, execution, refresh, and selection cleanup.
6. Verify deep links, the complete Markets sidebar, the bottom Documentation icon, `/docs/` nested
   routes, the global-chrome ownership boundary, and repeated theme updates.
7. Retain the previous site/Command Center release for the agreed rollback window.
8. Confirm the automatic deployment run is terminal and the active deployment matches the pushed
   commit.

## Rollback

Rollback is a release switch, not a source rewrite:

1. restore the previous pinned site release;
2. restore the compatible API release if its contract also changed;
3. preserve the external widget package required by active saved workspaces;
4. confirm old routes and embedded navigation; and
5. record the failed commit, API/package versions, and observed contract mismatch.

No production-readiness claim is valid until the authenticated target platform has been verified.
The synchronized API and site releases must expose the pinned collection, discovery, preflight,
execution, and delegated transport contracts together.
