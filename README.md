# MainSequence Markets Site

Standalone and embeddable Vite/React application for the `mainsequencemarkets` `apps/v1` API.
The browser calls one exact configured API origin directly. It does not depend on Command Center's
connection registry, proxy, or session cache. Generic resource views, themes, and the static-site
iframe handshake come from the editable `@dev-mainsequence/command-center-sdk` dependency.

## Run locally

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` is required and must be an exact HTTP(S) origin. Embedded deployments must also
set `VITE_COMMAND_CENTER_ORIGIN` to one exact parent origin.

## Verification

```bash
cd frontend
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

The SDK alignment baseline is implemented, currently consumes editable SDK 0.1.9, and is locally
verified. Production bulk actions remain
gated on the backend discovery/preflight/execution contract documented under the API contract. The
independent widget package, authenticated platform release, and Command Center source removal remain
separate gated changes and are not claimed complete by this repository.
