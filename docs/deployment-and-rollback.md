# Deployment and rollback

## Platform-managed static release

The repository owns `.mainsequence/workflows/static-site.yaml`. It declares one release named
**Main Sequence Markets** with `root_directory: .`, Vite on Node.js 24, `dist` output, SPA
routing through `/index.html`, and automatic redeployment for every synchronized commit on the
registered `main` ProjectBranch. No development branch or second site release is declared.

The only application-specific browser build input is `VITE_FASTAPI_RELEASE_UID`, which selects the
Main Sequence Markets API release used by the SDK's delegated FastAPI transport. The platform owns
and injects the reserved `VITE_COMMAND_CENTER_ORIGIN`; do not commit or derive a Command Center
hostname. The FastAPI release UID is stable across automatic API redeployments; the SDK resolves
the current opaque RPC endpoint and delegated credential at request time. Do not add a copied
runtime URL to the platform workflow. Build inputs are public and must never contain credentials.

The deployable SDK is stored as `vendor/dev-mainsequence-command-center-sdk-0.1.13.tgz` and
referenced through a repository-relative `file:` dependency. The archive is the published npm
artifact and keeps remote builds reproducible without a workstation path.

## Local standalone build

Build with production origins injected at compile time:

```bash
VITE_API_BASE_URL=https://markets-api.example.com \
npm run build
```

The platform workflow publishes `dist/` as an SPA and falls back to `/index.html`. The
Command Center viewer must render the launch URL with the SDK `StaticSiteIframe` host, pass only the
current theme ID/mode plus the optional public user UID, and provide the delegated FastAPI
credential resolver.

## First cutover

1. Pin the intended site commit and API release.
2. Confirm the repository workflow was accepted for the exact `main` ProjectBranch.
3. Verify the target FastAPI release admits the deployed static-site origin and that delegated GET,
   POST, PATCH, and DELETE requests succeed.
4. Smoke-test authenticated standalone and embedded reads and mutations.
5. Verify backend bulk discovery, optional preflight, execution, refresh, and selection cleanup.
6. Verify deep links, the chrome-free embedded boundary, and repeated theme updates.
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
