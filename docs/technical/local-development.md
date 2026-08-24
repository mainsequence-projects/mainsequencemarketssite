# Local development

## Requirements

- Node.js 24 (`.nvmrc` is the local runtime pin)
- npm
- a reachable `mainsequencemarkets` `apps/v1` API

No Python environment or Main Sequence SDK is required by this site.

The Vite and Vitest configurations deduplicate React and ReactDOM. Keep that setting while the
Command Center SDK is consumed from the repository-contained package archive so its React peer
dependencies resolve to the application's runtime.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` to the API origin only, for example `http://127.0.0.1:8000`. Do not append
`/api/v1`, credentials, a query string, or a fragment.

From the repository root, VS Code's **Run and Debug** panel provides **Markets: Full Stack**. The
compound configuration starts the sibling Markets API with its `.venv` and authenticated `.env`
under `debugpy` at `http://127.0.0.1:8001`, starts Vite under the Node debugger at
`http://127.0.0.1:3010`, and starts Docusaurus at `http://127.0.0.1:3011`. Vite proxies `/docs`
to the Docusaurus server, so the documentation icon opens `http://127.0.0.1:3010/docs/` just as it
opens `/docs/` in the deployed artifact. The frontend configuration supplies
`VITE_API_BASE_URL=http://127.0.0.1:8001` directly, while the API targets its development-only CORS
wrapper and leaves `MSM_AUTO_REGISTER_NAMESPACE` unset. **Markets API (8001)**, **Markets Frontend
(3010)**, and **Markets Documentation (3011)** can also be launched independently. All three
processes use strict ports, so stop an existing listener before starting the corresponding debugger.
Embedded deployments do not use the
direct URL and instead target the release identified by `VITE_FASTAPI_RELEASE_UID`. Production
builds fail closed outside the Command Center iframe.

For iframe testing, set `VITE_FASTAPI_RELEASE_UID` to the intended target release and
`VITE_COMMAND_CENTER_ORIGIN` to the exact local parent origin. The application uses the SDK
`mainsequence.markets` static-site client; the parent host must use `StaticSiteIframe`, supply a
delegated FastAPI credential resolver, and never pass a general session credential. Vite emits
development CSP and security headers. Production hosting must configure equivalent headers itself.

## Commands

```bash
npm run api:generate  # regenerate TypeScript from the pinned contract
npm run api:check     # verify generated types and OpenAPI documentation metadata
npm run docs:api:generate # rebuild generated endpoint and schema pages from the pinned contract
npm run docs:dev      # run Docusaurus on port 3011
npm run theme:audit   # enforce the installed SDK's closed theme-token contract
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

`npm run build` first creates the Vite application and then adds the Docusaurus output under
`dist/docs/`. The documentation build regenerates the read-only API reference from the pinned JSON
before Docusaurus compiles it. It never contacts a live API. The result is the exact combined
artifact published by the static-site workflow.

The E2E suite enables its explicit test-only direct API path with deterministic fixture responses
and exercises the embedded SDK delegated FastAPI transport against the same fixtures. It never
mutates a live Markets deployment. The test-only build flag mounts a real SDK `StaticSiteIframe`
host at `/__iframe-host`; it is set by `npm run test:e2e` and is absent from ordinary builds.

The frontend requires every backend collection and sibling discovery endpoint documented in
`api-contract.md`. A missing or invalid discovery response is a contract failure surfaced to the
user; the browser does not synthesize columns, controls, or bulk actions as a fallback.
