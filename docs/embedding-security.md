# Embedding and security

## Configuration

- `VITE_API_BASE_URL`: required exact API origin in standalone mode only.
- `VITE_FASTAPI_RELEASE_UID`: required target ResourceRelease UID in embedded mode.
- `VITE_COMMAND_CENTER_ORIGIN`: required exact parent origin in embedded mode and injected by the
  static-site platform for deployed builds.
- `EMBED_FRAME_ANCESTORS`: hosting header input; keep it an explicit allowlist.

Wildcards, credentials, paths, query strings, fragments, and non-HTTP protocols fail closed.

## Protocol

Channel: `mainsequence.markets`

Version: `1`

The SDK child sends `ready`. The parent responds with `initialize`, containing only `theme`,
`themeId`, and the optional public user UID aliases required by version one. The SDK exposes these
as normalized `themeMode`, `themeId`, and `userUid` context. Repeated initialize messages update the
application without navigating the iframe. The same protocol carries SDK-owned, request-correlated
FastAPI credential messages; application code never parses those messages or accesses the token.
The protocol has no navigation, resize, auth-expired, or general-session message.

Messages are accepted only when both `event.source` and `event.origin` match the configured parent.
The SDK validates the channel, numeric version, message type, payload shape, source, origin, and
payload limit. `userUid` is untrusted display/routing context and never establishes request identity.
The parent must use the SDK `StaticSiteIframe` host so the same validation, reinitialization,
timeout, sandbox, and teardown rules apply on both sides.

After initialization, embedded mode renders only Markets route content. It does not render the
standalone SDK navigation shell, topbar, API Diagnostics navigation, or application-owned theme
and session controls. Main Command Center supplies global navigation, application selection,
global settings, account/session chrome, branding, and the current SDK theme context. The optional
standalone shell remains available only when the window is not embedded.

No session JWT, cookie, authorization header, email, name, organization, permissions, or backend
credential may be added to the iframe context. For embedded requests, `fetchFastApi` obtains and
contains a narrow, short-lived delegated credential in SDK memory; standalone development retains
the independent browser-gateway session flow.

## Required hosting headers

- `Content-Security-Policy` with an explicit `frame-ancestors` list;
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
- `Referrer-Policy: strict-origin-when-cross-origin`; and
- `X-Content-Type-Options: nosniff`.

The target FastAPI release must independently admit the exact deployed site origin or the supported
one-label static-site wildcard. CORS does not replace the delegated credential or route-level
authorization.

The browser suite mounts the child through the SDK `StaticSiteIframe` host and verifies the default
`allow-forms allow-same-origin allow-scripts` sandbox, exact-origin handshake, delegated FastAPI
requests, anonymous user context, embedded chrome boundary, repeated theme updates, payload
rejection, timeout behavior, and teardown.
