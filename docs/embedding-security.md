# Embedding and security

## Configuration

- `VITE_API_BASE_URL`: required exact API origin.
- `VITE_COMMAND_CENTER_ORIGIN`: required exact parent origin in embedded mode.
- `EMBED_FRAME_ANCESTORS`: hosting header input; keep it an explicit allowlist.

Wildcards, credentials, paths, query strings, fragments, and non-HTTP protocols fail closed.

## Protocol

Channel: `mainsequence.markets`

Version: `1`

The SDK child sends `ready`. The parent responds with `initialize`, containing only `theme`,
`themeId`, and the optional public user UID aliases required by version one. The SDK exposes these
as normalized `themeMode`, `themeId`, and `userUid` context. Repeated initialize messages update the
application without navigating the iframe. This protocol has no navigation, resize, auth-expired,
session, or credential message.

Messages are accepted only when both `event.source` and `event.origin` match the configured parent.
The SDK validates the channel, numeric version, message type, payload shape, source, origin, and
payload limit. `userUid` is untrusted display/routing context and never establishes request identity.
The parent must use the SDK `StaticSiteIframe` host so the same validation, reinitialization,
timeout, sandbox, and teardown rules apply on both sides.

After initialization, embedded mode renders only Markets route content. It does not render the
standalone sidebar, topbar, MainSequence brand, API Diagnostics navigation, or gateway-session
status. Main Command Center supplies global navigation, application selection, global settings,
account/session chrome, and branding. The optional standalone shell remains available only when the
window is not embedded.

No session JWT, cookie, authorization header, email, name, organization, permissions, or backend
credential may be added to the iframe context. API authentication remains an independent browser
gateway responsibility.

## Required hosting headers

- `Content-Security-Policy` with an explicit `frame-ancestors` list;
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
- `Referrer-Policy: strict-origin-when-cross-origin`; and
- `X-Content-Type-Options: nosniff`.

The API must independently configure an exact CORS origin allowlist, credentials support, and all
mutation methods used by the site.

The browser suite mounts the child through the SDK `StaticSiteIframe` host and verifies the default
`allow-forms allow-same-origin allow-scripts` sandbox, exact-origin handshake, anonymous user
context, embedded chrome boundary, repeated theme updates, payload rejection, timeout behavior, and
teardown.
