---
name: integrate-static-site-iframe
description: Build, migrate, review, or secure a project-owned static-site application embedded in Command Center with @dev-mainsequence/command-center-sdk/embed or /embed/react. Use for the mainsequence.* version-one ready/initialize handshake, StaticSiteIframe hosts, createStaticSiteIframeClient children, parent-origin configuration, theme propagation, public user UID context, iframe sandboxing, CSP, or static-site embed lifecycle and tests.
---

# Integrate A Static-Site Iframe

## Confirm The Protocol

Inspect the installed `/embed`, `/embed/react`, and `/theme` declarations and the iframe module
README before changing an integration. Use only APIs published by that installed SDK version.

Use this skill for project-owned static sites that exchange `mainsequence.*`, numeric version-one
`ready` and `initialize` messages. Use `$embed-command-center-app` instead for external widgets on
the separate `command-center-iframe@v1` props/inputs/outputs protocol. Never translate between the
two contracts.

## Build The Child Application

1. Read the exact parent origin from trusted deployment configuration.
2. Choose one stable, application-specific channel beginning with `mainsequence.`.
3. Create the client with `createStaticSiteIframeClient` and `window.parent`.
4. Install the message listener before calling `announceReady()`.
5. Apply every `onContext` update; theme or user context can change without iframe navigation.
6. Remove the listener and dispose the client only when the application is permanently disposed.

Apply known theme IDs with `resolveCommandCenterThemeById` and `applyThemePresetToRoot` from
`/theme`. Fall back to `themeMode` for an unknown preset. Import the packaged theme CSS when using
SDK theme variables.

Consume `context.userUid` only as untrusted display or routing context. Authenticate backend calls
separately. Never accept that UID as proof of identity or permission.

## Build The Host

Prefer `StaticSiteIframe` from `/embed/react`. Supply the authorized launch URL, current theme ID
and mode, and either the public user UID or `null`. Let the SDK own the ready/initialize handshake,
source/origin validation, reinitialization, payload limit, timeout, and teardown.

Keep launch-URL acquisition, exchange tokens, authentication stores, release authorization,
routing, and viewer chrome in the host application. The SDK must not import those product
services. Use `createStaticSiteIframeHost` only for a framework-independent host.

Review any change to the component's default sandbox. Add popups, downloads, modals, or navigation
only when required and security-reviewed. Keep production origins on exact HTTPS values and align
the host's `frame-src` with the child's `frame-ancestors` CSP.

## Protect User And Session Data

Preserve the version-one wire aliases `id`, `uid`, and `user_uid`, which all contain the same public
UID. New child code reads only the SDK-normalized `userUid`.

Never send a session JWT, cookie, auth header, full user/session object, email, name, organization,
permissions, or unrestricted backend credential through iframe context. Do not expand the public
wire shape without an explicit protocol compatibility and security review.

## Verify

Test the valid handshake, wrong origin, wrong source window, invalid channel/version/payload,
anonymous context, repeated theme/user initialization, payload limits, handshake timeout,
navigation, and teardown. Confirm the iframe CSP and sandbox in a real browser when capabilities
change. State explicitly whether backend, launch-token, CSP, or storage contracts are affected.
