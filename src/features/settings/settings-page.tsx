import type { EntitySummary as EntitySummaryModel } from "@dev-mainsequence/command-center-sdk/resource";
import { EntitySummary, ResourceDetailShell } from "@dev-mainsequence/command-center-sdk/views";
import { ExternalLink } from "lucide-react";
import { useCallback, useState } from "react";

import { ApiRecordView } from "@/components/api-record-view";
import { ErrorState } from "@/components/state-view";
import { useRuntime } from "@/app/runtime-provider";
import { apiGet } from "@/lib/api/client";
import { useApiQuery } from "@/lib/api/use-api-query";

const tabs = [
  { id: "overview", label: "Runtime" },
  { id: "documentation", label: "API Documentation" },
  { id: "metadata", label: "Public Metadata" },
] as const;

export function ApiDiagnosticsPage() {
  const runtime = useRuntime();
  const { configuration } = runtime;
  const { apiOrigin } = configuration;
  const [activeTabId, setActiveTabId] = useState("overview");
  const load = useCallback(
    (signal: AbortSignal) => apiGet<unknown>("/api/v1/settings/", undefined, {
      signal,
      operationId: "getApiSettings",
    }),
    [],
  );
  const query = useApiQuery("getApiSettings", load);
  const docs = [
    ["Swagger UI", "/docs"],
    ["ReDoc", "/redoc"],
    ["OpenAPI JSON", "/openapi.json"],
    ["Adapter contract", "/.well-known/command-center/connection-contract"],
  ] as const;
  return (
    <main className="content" id="main-content">
      <ResourceDetailShell
        activeTabId={activeTabId}
        breadcrumbs={[{ id: "api-diagnostics", label: "API Diagnostics" }]}
        error={activeTabId === "metadata" && query.error
          ? <ErrorState error={query.error} onRetry={query.reload} />
          : undefined}
        loading={activeTabId === "metadata" && query.loading}
        loadingDescription="Requesting public runtime metadata from the Markets API."
        loadingTitle="Loading API diagnostics…"
        onTabChange={setActiveTabId}
        summary={<EntitySummary summary={settingsSummary(runtime)} />}
        tabs={tabs}
        tabsAccessory={activeTabId === "metadata"
          ? <code className="operation-id">getApiSettings</code>
          : undefined}
      >
        {activeTabId === "overview" ? (
          <ApiRecordView value={{
            api_origin: configuration.apiOrigin,
            fastapi_release_uid: configuration.fastApiReleaseUid,
            authentication: configuration.embedded
              ? "SDK delegated FastAPI credential"
              : "Authenticated browser gateway session",
            credentials_policy: configuration.embedded ? "memory-only delegated bearer" : "include",
            embed_mode: configuration.embedded ? "embedded" : "standalone",
            transport_status: runtime.fastApiState?.status ?? (configuration.embedded ? "idle" : "direct"),
            public_user_context: runtime.userUid,
          }} />
        ) : null}
        {activeTabId === "documentation" ? (
          apiOrigin ? (
            <div className="docs-links">
              {docs.map(([label, path]) => (
                <a href={new URL(path, apiOrigin).toString()} target="_blank" rel="noreferrer" key={path}>
                  <span>{label}<small>{path}</small></span><ExternalLink size={15} />
                </a>
              ))}
            </div>
          ) : (
            <ApiRecordView value={{
              access: "API documentation is available through the delegated embedded transport.",
              paths: Object.fromEntries(docs),
            }} />
          )
        ) : null}
        {activeTabId === "metadata" && !query.loading && !query.error
          ? <ApiRecordView value={query.data} />
          : null}
      </ResourceDetailShell>
    </main>
  );
}

function settingsSummary(runtime: ReturnType<typeof useRuntime>): EntitySummaryModel {
  const target = runtime.configuration.embedded
    ? runtime.configuration.fastApiReleaseUid
    : runtime.configuration.apiOrigin;
  return {
    entity: { id: target ?? "markets-api", type: "Markets API", title: "API Diagnostics" },
    badges: [{
      key: "mode",
      label: runtime.configuration.embedded ? "Embedded" : "Standalone",
      tone: "info",
    }],
    inline_fields: [{
      key: "api-target",
      label: runtime.configuration.embedded ? "FastAPI release UID" : "Exact API origin",
      value: target ?? "Not configured",
      kind: "code",
    }],
    highlight_fields: [
      {
        key: "authentication",
        label: "Authentication",
        value: runtime.configuration.embedded ? "Delegated FastAPI" : "Browser gateway",
      },
      {
        key: "credentials",
        label: "Credentials policy",
        value: runtime.configuration.embedded ? "Memory-only SDK credential" : "include",
      },
      { key: "contract", label: "API contract", value: "apps/v1 · 128 operations" },
    ],
    stats: [],
  };
}
