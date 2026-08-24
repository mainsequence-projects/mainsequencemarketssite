# API Diagnostics

**Location:** Platform → Platform Tools → API Diagnostics

API Diagnostics explains which Markets API the application is using and how the current browser
session reaches it. It is an inspection surface and does not change runtime configuration.

## Runtime

The Runtime tab shows embedded or local-development mode, the active API target, authentication
mode, credential policy, transport status, and public user context. Embedded mode identifies a
FastAPI release; local direct mode identifies an exact API origin.

## API Documentation

When a direct API origin is available, this tab links to Swagger UI, ReDoc, the OpenAPI document,
and the Command Center adapter contract. In delegated embedded mode it reports the same paths
without exposing an internal credential or transport endpoint.

## Public Metadata

Public Metadata requests the API's public settings record. Use refresh or retry to distinguish a
temporary transport failure from the returned runtime state.

This page can reveal identifiers and connection mode useful for support. It never displays the
delegated bearer credential.
