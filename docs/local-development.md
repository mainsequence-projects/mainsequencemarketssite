# Local development

## Requirements

- Node.js 24 (`frontend/.nvmrc` is the local runtime pin)
- npm
- a reachable `mainsequencemarkets` `apps/v1` API

No Python environment or Main Sequence SDK is required by this site.

The Vite and Vitest configurations deduplicate React and ReactDOM. Keep that setting while the
Command Center SDK is consumed from the repository-contained package archive so its React peer
dependencies resolve to the application's runtime.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` to the API origin only, for example `http://127.0.0.1:8000`. Do not append
`/api/v1`, credentials, a query string, or a fragment.

From the repository root, VS Code's **Run and Debug** panel provides **Markets: Full Stack**. The
compound configuration starts the sibling Markets API with its `.venv` and authenticated `.env`
under `debugpy` at `http://127.0.0.1:8001`, then starts Vite under the Node debugger at
`http://127.0.0.1:3010` and opens the application root. The frontend configuration supplies
`VITE_API_BASE_URL=http://127.0.0.1:8001` directly, while the API targets its development-only CORS
wrapper and leaves `MSM_AUTO_REGISTER_NAMESPACE` unset. **Markets API (8001)** and **Markets
Frontend (3010)** can also be launched independently. Both processes use strict ports, so stop an
existing listener before starting the corresponding debugger. Embedded deployments do not use the
direct URL and instead target the release identified by `VITE_FASTAPI_RELEASE_UID`.

For iframe testing, set `VITE_FASTAPI_RELEASE_UID` to the intended target release and
`VITE_COMMAND_CENTER_ORIGIN` to the exact local parent origin. The application uses the SDK
`mainsequence.markets` static-site client; the parent host must use `StaticSiteIframe`, supply a
delegated FastAPI credential resolver, and never pass a general session credential. Vite emits
development CSP and security headers. Production hosting must configure equivalent headers itself.

## Commands

```bash
npm run api:generate  # regenerate TypeScript from the pinned contract
npm run api:check     # prove generated types are current
npm run theme:audit   # enforce the installed SDK's closed theme-token contract
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The E2E suite intercepts the configured standalone API origin with deterministic fixture responses
and exercises the embedded SDK delegated FastAPI transport against the same fixtures. It never
mutates a live Markets deployment. The test-only build flag mounts a real SDK `StaticSiteIframe`
host at `/__iframe-host`; it is set by `npm run test:e2e` and is absent from ordinary builds.

The frontend expects the backend bulk-action discovery endpoints documented in `api-contract.md`.
Local API versions that do not provide them may still serve resources without bulk actions, but a
discovery error is surfaced and the bulk action is not trusted or synthesized in the browser.
