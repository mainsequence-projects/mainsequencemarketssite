# Main Sequence Markets

Embedded Vite/React application for the `mainsequencemarkets` `apps/v1` API. Production builds call
the configured FastAPI ResourceRelease through the Command Center SDK's short-lived delegated
iframe transport. Local development can call one exact configured API origin directly. Controlled
Markets navigation, resource views, themes, and the static-site
iframe lifecycle come from `@dev-mainsequence/command-center-sdk`. The same deployed static
artifact serves the independent Docusaurus documentation site under `/docs/`.

## Run locally

Use Node.js 24. The frontend package enforces the `24.x` engine range and includes an `.nvmrc`
for local version managers.

```bash
nvm use
npm install
cp .env.example .env.local
npm run dev
```

Local Vite development requires `VITE_API_BASE_URL` to be an exact HTTP(S) origin. Embedded
production requires `VITE_FASTAPI_RELEASE_UID`; the static-site platform injects the reserved exact
`VITE_COMMAND_CENTER_ORIGIN` for the Command Center host.

### Debug the full stack in VS Code

Open this static-site repository as the VS Code workspace, select **Run and Debug**, and launch
**Markets: Full Stack**. The compound configuration starts:

- the sibling `mainsequencemarkets` FastAPI app under `debugpy` at `http://127.0.0.1:8001`
- this Vite frontend under the Node debugger at `http://127.0.0.1:3010`
- the Docusaurus documentation server at `http://127.0.0.1:3011`, proxied by Vite at
  `http://127.0.0.1:3010/docs/`

The frontend launch supplies `VITE_API_BASE_URL=http://127.0.0.1:8001` directly. Port 8001 avoids
the commonly occupied conventional port 8000. The API launch
uses the sibling repository's `.venv` and authenticated `.env`, and targets the development-only
CORS wrapper. It intentionally leaves `MSM_AUTO_REGISTER_NAMESPACE` unset. The individual
**Markets API (8001)**, **Markets Frontend (3010)**, and **Markets Documentation (3011)**
configurations remain available when only one process needs debugging.

## Automatic deployment

`.mainsequence/workflows/static-site.yaml` declares one Vite SPA release named **Main Sequence
Markets** for the registered `main` ProjectBranch. Every synchronized `main` commit is eligible for
automatic rebuild and deployment. The remote builder installs the repository-contained Command
Center SDK `0.1.13` archive, so it does not depend on a developer-local path or an unpinned registry
package. Its public build environment contains only the stable `main` Markets FastAPI
ResourceRelease UID. Automatic API redeployments keep that identity, while the SDK obtains the
current opaque RPC endpoint and delegated credential at request time; the workflow must not copy a
runtime URL or credential into the browser bundle. The production site is embedded-only and retains
the complete Markets-owned left navigation inside Command Center.

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

The deployed application exposes the Docusaurus site at `/docs/`. Open it with the documentation
icon fixed to the bottom of the Markets application rail. Documentation is divided by audience:

- [Application surfaces](docs/surfaces/index.md) explains the views and actions people use. Its
  hierarchy mirrors the left navigation: Assets, Portfolios, Managed Accounts, Pricing, and
  Platform.
- [Technical documentation](docs/technical/index.md) covers architecture, development, API
  contracts, security, deployment, change history, and implementation plans.
- [Generated API reference](docs/technical/api-reference.md) renders every operation and schema
  from the pinned OpenAPI contract; its canonical source is the
  [Main Sequence Markets API repository](https://github.com/mainsequence-projects/MainSequenceMarkets).
- [Complete documentation map](docs/SUMMARY.md)

The SDK alignment baseline is implemented against the repository-contained SDK `0.1.13` package.
All 25 backend collections and discovery operations are captured in the
[pinned OpenAPI document](docs/technical/contracts/mainsequencemarkets-openapi.json),
and account and pricing-curve views use distinct canonical detail and summary operations. Applying
and observing the authenticated platform release remains a separate deployment step after this
repository change is committed and synchronized.
