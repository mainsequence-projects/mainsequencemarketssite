# Local development

## Requirements

- Node.js 22 or newer
- npm
- a reachable `mainsequencemarkets` `apps/v1` API

No Python environment or Main Sequence SDK is required by this site.

The Vite and Vitest configurations deduplicate React and ReactDOM. Keep that setting while the
Command Center SDK is installed through its editable local symlink; otherwise the SDK checkout can
contribute a second React runtime and hook-based views will fail in the browser.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` to the API origin only, for example `http://127.0.0.1:8000`. Do not append
`/api/v1`, credentials, a query string, or a fragment.

For iframe testing, also set an exact `VITE_COMMAND_CENTER_ORIGIN`. The application uses the SDK
`mainsequence.markets` static-site client; the parent host must use `StaticSiteIframe` or the matching
framework-independent SDK host. Vite emits development CSP and security headers. Production hosting
must configure equivalent headers itself.

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

The E2E suite intercepts the configured API origin with deterministic fixture responses. It never
mutates a live Markets deployment. The test-only build flag mounts a real SDK `StaticSiteIframe`
host at `/__iframe-host`; it is set by `npm run test:e2e` and is absent from ordinary builds.

The frontend expects the backend bulk-action discovery endpoints documented in `api-contract.md`.
Local API versions that do not provide them may still serve resources without bulk actions, but a
discovery error is surfaced and the bulk action is not trusted or synthesized in the browser.
