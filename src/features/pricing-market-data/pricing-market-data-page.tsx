import type { EntitySummary as EntitySummaryModel } from "@dev-mainsequence/command-center-sdk/resource";
import { EntitySummary, ResourceDetailShell } from "@dev-mainsequence/command-center-sdk/views";
import { useCallback, useState } from "react";

import { ApiRecordView } from "@/components/api-record-view";
import { ErrorState } from "@/components/state-view";
import {
  marketDataBindingsDefinition,
  marketDataSetsDefinition,
} from "@/features/resources/resource-definitions";
import { ResourceListPage } from "@/features/resources/resource-list-page";
import { apiGet } from "@/lib/api/client";
import type { ApiRecord } from "@/lib/api/types";
import { useApiQuery } from "@/lib/api/use-api-query";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "sets", label: "Market Data Sets" },
  { id: "bindings", label: "Concept Bindings" },
] as const;

export function PricingMarketDataPage() {
  const [activeTabId, setActiveTabId] = useState("overview");
  const load = useCallback(
    (signal: AbortSignal) => apiGet<unknown>("/api/v1/pricing/market_data/", undefined, {
      signal,
      operationId: "getPricingMarketDataCard",
    }),
    [],
  );
  const query = useApiQuery("getPricingMarketDataCard", load);
  const record = isRecord(query.data) ? query.data : {};

  return (
    <main className="content" id="main-content">
      <ResourceDetailShell
        activeTabId={activeTabId}
        breadcrumbs={[{ id: "pricing-market-data", label: "Pricing Market Data" }]}
        error={query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : undefined}
        loading={query.loading}
        loadingDescription="Requesting the pricing market-data card from the Markets API."
        loadingTitle="Loading pricing market data…"
        onTabChange={setActiveTabId}
        summary={<EntitySummary summary={pricingSummary(record)} />}
        tabs={tabs}
        tabsAccessory={activeTabId === "overview"
          ? <code className="operation-id">getPricingMarketDataCard</code>
          : undefined}
      >
        {activeTabId === "overview" ? <ApiRecordView value={query.data} /> : null}
        {activeTabId === "sets" ? <ResourceListPage definition={marketDataSetsDefinition} embedded /> : null}
        {activeTabId === "bindings" ? <ResourceListPage definition={marketDataBindingsDefinition} embedded /> : null}
      </ResourceDetailShell>
    </main>
  );
}

function pricingSummary(record: ApiRecord): EntitySummaryModel {
  const status = typeof record.status === "string" ? record.status : null;
  return {
    entity: {
      id: "pricing-market-data",
      type: "pricing market data",
      title: "Pricing Market Data",
    },
    badges: status ? [{ key: "status", label: status }] : [],
    inline_fields: [{
      key: "operation",
      label: "Canonical operation",
      value: "getPricingMarketDataCard",
      kind: "code",
    }],
    highlight_fields: [
      { key: "sets", label: "Sets", value: "Governed pricing environments" },
      { key: "bindings", label: "Bindings", value: "Concept-to-source resolution" },
    ],
    stats: Object.entries(record)
      .filter(([, value]) => typeof value === "number")
      .slice(0, 4)
      .map(([key, value]) => ({
        key,
        label: humanize(key),
        display: new Intl.NumberFormat().format(value as number),
        value,
      })),
  };
}

function humanize(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
