import type {
  EntitySummary as EntitySummaryModel,
  ResourceDetailTabDefinition,
} from "@dev-mainsequence/command-center-sdk/resource";
import { EntitySummary, ResourceDetailShell } from "@dev-mainsequence/command-center-sdk/views";
import { Pencil, Play, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ApiRecordView } from "@/components/api-record-view";
import { MutationDialog } from "@/components/mutation-dialog";
import { ErrorState, LoadingState } from "@/components/state-view";
import { createMarketsResourceApplication } from "@/features/resources/resource-adapter";
import type { DetailSectionDefinition, MutationDefinition, ResourceDefinition } from "@/features/resources/resource-definitions";
import { isRelatedCollection, RelatedResourceList } from "@/features/resources/related-resource-list";
import { useRouter } from "@/app/router";
import { apiGet } from "@/lib/api/client";
import { formatCellValue, recordUid, type ApiRecord } from "@/lib/api/types";
import { useApiQuery } from "@/lib/api/use-api-query";

type OpenMutation = { definition: MutationDefinition; initialValue?: unknown } | null;
type ActionResult = { title: string; operationId: string; value: unknown };

export function ResourceDetailPage({ definition, uid }: { definition: ResourceDefinition; uid: string }) {
  const safeUid = encodeURIComponent(uid);
  const { navigate } = useRouter();
  const [mutation, setMutation] = useState<OpenMutation>(null);
  const [actionResult, setActionResult] = useState<ActionResult | null>(null);
  const [activeTabId, setActiveTabId] = useState("overview");
  const application = useMemo(
    () => createMarketsResourceApplication(definition),
    [definition],
  );
  const loadDetail = useCallback(
    (signal: AbortSignal) => {
      if (!application.adapter.get) {
        throw new Error(`${definition.id} does not expose a detail adapter.`);
      }
      return application.adapter.get(uid, { signal });
    },
    [application.adapter, definition.id, uid],
  );
  const query = useApiQuery(`${definition.detailOperationId}:${safeUid}`, loadDetail);
  const tabs = useMemo<ResourceDetailTabDefinition<ApiRecord>[]>(() => [
    { id: "overview", label: "Overview" },
    ...(definition.details ?? []).map((section) => ({
      id: section.operationId,
      label: section.title,
    })),
    ...(actionResult ? [{ id: "operation-result", label: "Operation result" }] : []),
  ], [actionResult, definition.details]);

  async function runMutation(openMutation: NonNullable<OpenMutation>, body: unknown) {
    if (openMutation.definition === definition.remove) {
      if (!application.adapter.delete) throw new Error("Delete is not available for this resource.");
      await application.adapter.delete([uid]);
      navigate(definition.listRoute, { replace: true });
      return;
    }
    if (openMutation.definition === definition.update) {
      if (!application.adapter.update) throw new Error("Update is not available for this resource.");
      await application.adapter.update(uid, body);
      query.reload();
      return;
    }
    if (definition.actions?.includes(openMutation.definition)) {
      if (!application.adapter.executeAction) {
        throw new Error("Domain actions are not available for this resource.");
      }
      const result = await application.adapter.executeAction(openMutation.definition.operationId, {
        ids: [uid],
        items: record ? [record] : [],
        payload: body,
      });
      setActionResult({
        title: openMutation.definition.label,
        operationId: openMutation.definition.operationId,
        value: result,
      });
      setActiveTabId("operation-result");
      query.reload();
      return;
    }
    throw new Error(`Unsupported resource action ${openMutation.definition.operationId}.`);
  }

  const record = isRecord(query.data) ? query.data : null;
  const title = detailTitle(record, definition.singular, uid);
  const selectedDetail = definition.details?.find((section) => section.operationId === activeTabId);
  const activeOperationId = selectedDetail?.operationId
    ?? (activeTabId === "operation-result" ? actionResult?.operationId : definition.detailOperationId);

  return (
    <main className="content" id="main-content">
      <ResourceDetailShell
        activeTabId={activeTabId}
        breadcrumbs={[
          { id: definition.id, label: definition.title, onSelect: () => navigate(definition.listRoute) },
          { id: uid, label: title },
        ]}
        error={query.error ? <ErrorState error={query.error} onRetry={query.reload} /> : undefined}
        headerActions={<DetailActions definition={definition} onSelect={setMutation} />}
        loading={query.loading}
        loadingDescription={`Requesting ${definition.detailOperationId ?? "the resource detail"} from the Markets API.`}
        loadingTitle={`Loading ${definition.singular}…`}
        onTabChange={setActiveTabId}
        summary={record ? <EntitySummary summary={buildEntitySummary(definition, record, uid)} /> : undefined}
        tabs={tabs}
        tabsAccessory={activeOperationId ? <code className="operation-id">{activeOperationId}</code> : undefined}
      >
        {!query.loading && !query.error ? (
          <>
            {activeTabId === "overview" ? <ApiRecordView value={query.data} /> : null}
            {selectedDetail ? <DetailSection definition={selectedDetail} uid={safeUid} /> : null}
            {activeTabId === "operation-result" && actionResult ? (
              <ApiRecordView value={actionResult.value} />
            ) : null}
          </>
        ) : null}
      </ResourceDetailShell>

      {mutation ? (
        <MutationDialog
          open
          title={mutation.definition.label}
          description={mutation.definition.description}
          operationId={mutation.definition.operationId}
          initialValue={mutation.initialValue}
          destructive={mutation.definition.destructive}
          onClose={() => setMutation(null)}
          onSubmit={(body) => runMutation(mutation, body)}
        />
      ) : null}
    </main>
  );
}

function DetailActions({
  definition,
  onSelect,
}: {
  definition: ResourceDefinition;
  onSelect: (mutation: NonNullable<OpenMutation>) => void;
}) {
  return (
    <>
      {definition.update ? (
        <button
          className="button secondary compact"
          type="button"
          onClick={() => onSelect({ definition: definition.update!, initialValue: definition.update!.template })}
        ><Pencil size={14} /> {definition.update.label}</button>
      ) : null}
      {(definition.actions ?? []).map((action) => (
        <button
          className={action.destructive ? "button danger-button compact" : "button secondary compact"}
          key={action.operationId}
          type="button"
          onClick={() => onSelect({ definition: action, initialValue: action.template })}
        >{action.destructive ? <Trash2 size={14} /> : <Play size={14} />} {action.label}</button>
      ))}
      {definition.remove ? (
        <button
          className="button danger-button compact"
          type="button"
          onClick={() => onSelect({ definition: definition.remove! })}
        ><Trash2 size={14} /> {definition.remove.label}</button>
      ) : null}
    </>
  );
}

function DetailSection({ definition, uid }: { definition: DetailSectionDefinition; uid: string }) {
  return isRelatedCollection(definition.operationId)
    ? <RelatedResourceList definition={definition} uid={uid} />
    : <DetailRecordSection definition={definition} uid={uid} />;
}

function DetailRecordSection({ definition, uid }: { definition: DetailSectionDefinition; uid: string }) {
  const path = definition.path(uid);
  const load = useCallback(
    (signal: AbortSignal) => apiGet<unknown>(path, undefined, { signal, operationId: definition.operationId }),
    [definition.operationId, path],
  );
  const query = useApiQuery(`${definition.operationId}:${uid}`, load);

  if (query.loading) return <LoadingState label={`Loading ${definition.title.toLowerCase()}`} />;
  if (query.error) return <ErrorState error={query.error} onRetry={query.reload} />;
  return <ApiRecordView value={query.data} />;
}

export function buildEntitySummary(
  definition: ResourceDefinition,
  record: ApiRecord,
  fallbackUid: string,
): EntitySummaryModel {
  const uid = recordUid(record) ?? fallbackUid;
  const title = detailTitle(record, definition.singular, fallbackUid);
  const badgeKey = ["status", "state", "asset_type", "index_type"]
    .find((key) => record[key] !== undefined && record[key] !== null);
  const identityKeys = new Set(["uid", "id", "unique_identifier", "set_key"]);

  return {
    entity: { id: uid, type: definition.singular, title },
    badges: badgeKey ? [{ key: badgeKey, label: formatCellValue(record[badgeKey]) }] : [],
    inline_fields: [
      { key: "uid", label: "UID", value: uid, kind: "code" },
      ...(typeof record.unique_identifier === "string" ? [{
        key: "unique_identifier",
        label: "Identifier",
        value: record.unique_identifier,
        kind: "code",
      }] : []),
    ],
    highlight_fields: definition.columns
      .filter((column) => !identityKeys.has(column.key) && record[column.key] !== undefined)
      .slice(0, 6)
      .map((column) => ({
        key: column.key,
        label: column.label,
        value: record[column.key],
      })),
    stats: [],
  };
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function detailTitle(value: ApiRecord | null, fallback: string, uid: string): string {
  if (value) {
    for (const key of ["display_name", "account_name", "unique_identifier", "title", "set_key"]) {
      if (typeof value[key] === "string" && value[key]) return String(value[key]);
    }
  }
  return `${fallback.charAt(0).toUpperCase()}${fallback.slice(1)} · ${uid}`;
}
