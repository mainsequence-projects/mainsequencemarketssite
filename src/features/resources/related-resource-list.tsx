import {
  defineResourceApplication,
} from "@dev-mainsequence/command-center-sdk/resource";
import { ResourceListPage } from "@dev-mainsequence/command-center-sdk/views";
import { useMemo } from "react";

import { useRouter } from "@/app/router";
import {
  createCanonicalMarketsResourceAdapter,
  sdkResourceColumnId,
} from "@/features/resources/resource-adapter";
import type { DetailSectionDefinition } from "@/features/resources/resource-definitions";
import { resourceDefinitions } from "@/features/resources/resource-definitions";
import type { MarketsOperationId } from "@/lib/api/contracts";
import type { ApiRecord } from "@/lib/api/types";

type RelatedColumn = { id: string; label: string; path?: string };
type RelatedCollectionConfig = {
  id: string;
  itemLabel: string;
  idPaths: readonly string[];
  columns: readonly RelatedColumn[];
  activationResource?: string;
};

const relatedCollections: Partial<Record<MarketsOperationId, RelatedCollectionConfig>> = {
  listAssetRelatedMetaTables: metaTableCollection("asset-related-meta-tables"),
  listIndexRelatedMetaTables: metaTableCollection("index-related-meta-tables"),
  listIndexFormulas: {
    id: "index-formulas",
    itemLabel: "formulas",
    idPaths: ["uid"],
    columns: [
      { id: "version", label: "Version" },
      { id: "status", label: "Status" },
      { id: "valid_from", label: "Valid from" },
      { id: "input_count", label: "Inputs" },
      { id: "formula", label: "Formula" },
    ],
  },
  listIndexDatasets: {
    id: "index-datasets",
    itemLabel: "datasets",
    idPaths: ["dataset.meta_table_uid", "dataset.identifier"],
    columns: [
      { id: "identifier", label: "Identifier", path: "dataset.identifier" },
      { id: "population_state", label: "Population" },
      { id: "row_count", label: "Rows" },
      { id: "latest_time_index", label: "Latest time" },
    ],
  },
  listCalendarDates: {
    id: "calendar-dates",
    itemLabel: "dates",
    idPaths: ["uid"],
    columns: [
      { id: "local_date", label: "Date" },
      { id: "is_business_day", label: "Business day" },
      { id: "is_holiday", label: "Holiday" },
      { id: "holiday_name", label: "Holiday name" },
    ],
  },
  listCalendarSessions: {
    id: "calendar-sessions",
    itemLabel: "sessions",
    idPaths: ["uid"],
    columns: [
      { id: "local_date", label: "Date" },
      { id: "session_label", label: "Session" },
      { id: "opens_at", label: "Opens" },
      { id: "closes_at", label: "Closes" },
      { id: "timezone", label: "Timezone" },
    ],
  },
  listCalendarEvents: {
    id: "calendar-events",
    itemLabel: "events",
    idPaths: ["uid"],
    columns: [
      { id: "event_date", label: "Date" },
      { id: "event_type", label: "Type" },
      { id: "event_label", label: "Label" },
      { id: "target_identifier", label: "Target" },
    ],
  },
  listPortfoliosInGroup: {
    id: "portfolio-group-portfolios",
    itemLabel: "portfolios",
    idPaths: ["uid"],
    activationResource: "portfolios",
    columns: [
      { id: "unique_identifier", label: "Identifier" },
      { id: "calendar_uid", label: "Calendar" },
      { id: "published_index_uid", label: "Published index" },
      { id: "uid", label: "UID" },
    ],
  },
  listPricingMarketDataSetBindings: {
    id: "market-data-set-bindings",
    itemLabel: "bindings",
    idPaths: ["uid"],
    activationResource: "pricing-market-data-bindings",
    columns: [
      { id: "concept_key", label: "Concept" },
      { id: "source", label: "Source" },
      { id: "data_node_uid", label: "DataNode" },
      { id: "storage_table_identifier", label: "Storage table" },
    ],
  },
  listPricingCurveSelections: {
    id: "pricing-curve-selections",
    itemLabel: "selections",
    idPaths: ["binding_uid"],
    columns: [
      { id: "role_key", label: "Role" },
      { id: "status", label: "Status" },
      { id: "source", label: "Source" },
      { id: "quote_side", label: "Quote side" },
      { id: "binding_uid", label: "Binding UID" },
    ],
  },
};

export function isRelatedCollection(operationId: MarketsOperationId): boolean {
  return Boolean(relatedCollections[operationId]);
}

export function RelatedResourceList({
  definition,
  uid,
}: {
  definition: DetailSectionDefinition;
  uid: string;
}) {
  const { navigate } = useRouter();
  const config = relatedCollections[definition.operationId];
  if (!config) throw new Error(`${definition.operationId} is not a declared related collection.`);
  const endpoint = definition.path(uid);
  const application = useMemo(() => {
    const adapter = createCanonicalMarketsResourceAdapter({
      listPath: endpoint,
      listOperationId: definition.operationId,
    });

    return defineResourceApplication<ApiRecord, string>({
      id: relatedApplicationId(config.id, uid),
      label: definition.title,
      itemLabel: config.itemLabel,
      getId: (item) => relatedId(config, item),
      adapter,
      activation: config.activationResource ? {
        resolve: (item) => ({
          resource: config.activationResource!,
          uid: relatedId(config, item),
        }),
      } : undefined,
      columns: config.columns.map((column) => ({
        id: sdkResourceColumnId(column.id),
        header: column.label,
        getValue: (item) => readPath(item, column.path ?? column.id),
      })),
    });
  }, [config, definition.operationId, definition.title, endpoint, uid]);
  const navigation = useMemo(() => ({
    open: (intent: { resource: string; uid: string | number }) => {
      const target = resourceDefinitions.find((candidate) => candidate.id === intent.resource);
      if (target?.detailRoute) {
        navigate(`${target.listRoute}/${encodeURIComponent(String(intent.uid))}`);
      }
    },
  }), [navigate]);

  return (
    <ResourceListPage
      definition={application}
      embedded
      navigation={navigation}
      pageSize={10}
      refreshable
      searchable={false}
    />
  );
}

export function relatedApplicationId(collectionId: string, uid: string): string {
  const encodedUid = Array.from(uid, (character) => character.codePointAt(0)!.toString(16)).join("-");
  return `${collectionId}.instance.${encodedUid || "0"}`;
}

function metaTableCollection(id: string): RelatedCollectionConfig {
  return {
    id,
    itemLabel: "related tables",
    idPaths: ["meta_table_uid", "key", "identifier"],
    columns: [
      { id: "label", label: "Label" },
      { id: "identifier", label: "Identifier" },
      { id: "relationship_type", label: "Relationship" },
      { id: "count", label: "Rows" },
      { id: "delete_capability", label: "Delete behavior" },
    ],
  };
}

function relatedId(config: RelatedCollectionConfig, item: ApiRecord): string {
  for (const path of config.idPaths) {
    const value = readPath(item, path);
    if (typeof value === "string" && value) return value;
    if (typeof value === "number") return String(value);
  }
  throw new Error(`${config.id} returned a row without a stable identifier.`);
}

function readPath(record: ApiRecord, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => (
    isRecord(value) ? value[key] : undefined
  ), record);
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
