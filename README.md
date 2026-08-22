# Main Sequence Markets

Standalone and embeddable Vite/React application for the `mainsequencemarkets` `apps/v1` API.
Embedded builds call the configured FastAPI ResourceRelease through the Command Center SDK's
short-lived delegated iframe transport. Standalone local development can call one exact configured
API origin directly. Controlled standalone navigation, resource views, themes, and the static-site
iframe lifecycle come from `@dev-mainsequence/command-center-sdk`.

## Run locally

Use Node.js 24. The frontend package enforces the `24.x` engine range and includes an `.nvmrc`
for local version managers.

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Standalone mode requires `VITE_API_BASE_URL` to be an exact HTTP(S) origin. Embedded mode requires
`VITE_FASTAPI_RELEASE_UID`; the static-site platform injects the reserved exact
`VITE_COMMAND_CENTER_ORIGIN` for the Command Center host.

### Debug the full stack in VS Code

Open this static-site repository as the VS Code workspace, select **Run and Debug**, and launch
**Markets: Full Stack**. The compound configuration starts:

- the sibling `mainsequencemarkets` FastAPI app under `debugpy` at `http://127.0.0.1:8001`
- this Vite frontend under the Node debugger at `http://127.0.0.1:3010`

The frontend launch supplies `VITE_API_BASE_URL=http://127.0.0.1:8001` directly. Port 8001 avoids
the commonly occupied conventional port 8000. The API launch
uses the sibling repository's `.venv` and authenticated `.env`, and targets the development-only
CORS wrapper. It intentionally leaves `MSM_AUTO_REGISTER_NAMESPACE` unset. The individual
**Markets API (8001)** and **Markets Frontend (3010)** configurations remain available when only
one process needs debugging.

## Automatic deployment

`.mainsequence/workflows/static-site.yaml` declares one Vite SPA release named **Main Sequence
Markets** for the registered `main` ProjectBranch. Every synchronized `main` commit is eligible for
automatic rebuild and deployment. The remote builder installs the repository-contained Command
Center SDK `0.1.13` archive, so it does not depend on a developer-local path or an unpinned registry
package. Its public build environment contains the stable `main` Markets FastAPI ResourceRelease
UID. Automatic API redeployments keep that identity, while the SDK obtains the current opaque RPC
endpoint and delegated credential at request time; the workflow must not copy a runtime URL or
credential into the browser bundle.

## Verification

```bash
npm run api:check
npm run theme:audit
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## Documentation

- [Architecture](docs/architecture.md)
- [Local development](docs/local-development.md)
- [API contract](docs/api-contract.md)
- [Route compatibility](docs/route-compatibility.md)
- [Embedding and security](docs/embedding-security.md)
- [Deployment and rollback](docs/deployment-and-rollback.md)
- [Implementation plan](docs/implementation_tasks/001_mainsequence_markets_site_refactor.md)
- [Full SDK refactor implementation](docs/implementation_tasks/002_command_center_sdk_normalization.md)
- [SDK alignment plan (0.1.3 baseline)](docs/implementation_tasks/003_command_center_sdk_0_1_3_alignment.md)

The SDK alignment baseline is implemented against the repository-contained SDK `0.1.13` package.
All 25 backend collections and discovery operations are captured in the pinned OpenAPI document,
and account and pricing-curve views use distinct canonical detail and summary operations. Applying
and observing the authenticated platform release remains a separate deployment step after this
repository change is committed and synchronized.
