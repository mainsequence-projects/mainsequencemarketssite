# Deployment and rollback

## Platform-managed static release

The repository owns `.mainsequence/workflows/static-site.yaml`. It declares one release named
**Main Sequence Markets** with `root_directory: .`, Vite on Node.js 24, `dist` output, SPA
routing through `/index.html`, and automatic redeployment for every synchronized commit on the
registered `main` ProjectBranch. No development branch or second site release is declared.

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
Main Sequence Markets API release used by the SDK's delegated FastAPI transport. The platform owns
and injects the reserved `VITE_COMMAND_CENTER_ORIGIN`; do not commit or derive a Command Center
hostname. The FastAPI release UID is stable across automatic API redeployments; the SDK resolves
the current opaque RPC endpoint and delegated credential at request time. Do not add a copied
runtime URL to the platform workflow. Build inputs are public and must never contain credentials.
The production application is embedded-only. Opening the static release URL outside Command Center
fails closed instead of switching to a direct browser API origin.

The deployable SDK is stored as `vendor/dev-mainsequence-command-center-sdk-0.1.13.tgz` and
referenced through a repository-relative `file:` dependency. The archive is the published npm
artifact and keeps remote builds reproducible without a workstation path.

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
2. Confirm the repository workflow was accepted for the exact `main` ProjectBranch.
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
