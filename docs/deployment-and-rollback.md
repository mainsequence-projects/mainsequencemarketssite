# Deployment and rollback

## Build artifact

Build with production origins injected at compile time:

```bash
cd frontend
VITE_API_BASE_URL=https://markets-api.example.com \
VITE_COMMAND_CENTER_ORIGIN=https://command-center.example.com \
npm run build
```

Publish `frontend/dist/` as an SPA. The static host must fall back to `index.html` for every route in
the compatibility table and must emit the security headers documented under embedding and security.
The Command Center viewer must render the launch URL with the SDK `StaticSiteIframe` host and pass
only the current theme ID/mode plus the optional public user UID.

## First cutover

1. Pin the intended site commit and API release.
2. Keep automatic deployment disabled.
3. Verify API CORS preflights for GET, POST, PATCH, and DELETE with credentials.
4. Smoke-test authenticated standalone and embedded reads and mutations.
5. Verify deep links and repeated theme updates.
6. Retain the previous site/Command Center release for the agreed rollback window.
7. Enable automatic deployment only after rollback has been exercised.

## Rollback

Rollback is a release switch, not a source rewrite:

1. restore the previous pinned site release;
2. restore the compatible API release if its contract also changed;
3. preserve the external widget package required by active saved workspaces;
4. confirm old routes and embedded navigation; and
5. record the failed commit, API/package versions, and observed contract mismatch.

No production-readiness claim is valid until the authenticated target platform has been verified.
