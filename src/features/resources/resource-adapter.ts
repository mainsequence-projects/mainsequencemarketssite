import {
  createHttpResourceAdapter,
  defineResourceApplication,
  type ResourceApplicationDefinition,
  type ResourceAdapter,
  type ResourceHttpClient,
  type ResourceListRequest,
  type ResourceListResult,
} from "@dev-mainsequence/command-center-sdk/resource";

import type { ResourceDefinition } from "@/features/resources/resource-definitions";
import { apiRequest, type QueryValue } from "@/lib/api/client";
import type { MarketsOperationId } from "@/lib/api/contracts";
import type { ApiRecord } from "@/lib/api/types";

export type MarketsResourceApplication = ResourceApplicationDefinition<ApiRecord, string>;

export function createMarketsResourceApplication(
  definition: ResourceDefinition,
): MarketsResourceApplication {
  const httpAdapter = createCanonicalMarketsResourceAdapter({
    listPath: definition.listPath,
    listOperationId: definition.listOperationId,
    detailPath: definition.detailPath
      ? (id) => definition.detailPath!(encodeURIComponent(id))
      : undefined,
    detailOperationId: definition.detailOperationId,
  });

  return defineResourceApplication({
    id: definition.id,
    label: definition.title,
    itemLabel: definition.title.toLocaleLowerCase(),
    description: definition.description,
    getId: requireRecordUid,
    columns: definition.columns.map((column) => ({
      id: sdkResourceColumnId(column.key),
      header: column.label,
      getValue: (resource) => resource[column.key],
    })),
    activation: definition.detailRoute ? {
      resolve: (resource) => ({ resource: definition.id, uid: requireRecordUid(resource) }),
    } : undefined,
    actions: [
      ...(definition.create ? [{
        id: sdkActionId(definition.create.operationId),
        label: definition.create.label,
        scope: "global" as const,
        tone: "primary" as const,
      }] : []),
      ...(definition.update ? [{
        id: sdkActionId(definition.update.operationId),
        label: definition.update.label,
        scope: "detail" as const,
      }] : []),
      ...(definition.actions ?? []).map((action) => ({
        id: sdkActionId(action.operationId),
        label: action.label,
        scope: "detail" as const,
        tone: action.destructive ? "danger" as const : "default" as const,
        requiresConfirmation: Boolean(action.destructive),
      })),
      ...(definition.remove ? [{
        id: sdkActionId(definition.remove.operationId),
        label: definition.remove.label,
        scope: "detail" as const,
        tone: "danger" as const,
        requiresConfirmation: true,
      }] : []),
    ],
    adapter: {
      ...httpAdapter,
      create: definition.create
        ? async (input, options) => requireMutationRecord(
          await apiRequest<unknown>({
            method: definition.create!.method,
            path: definition.create!.path(""),
            operationId: definition.create!.operationId,
            body: input,
            signal: options?.signal,
          }),
          definition.create!.operationId,
        )
        : undefined,
      update: definition.update
        ? async (id, input, options) => requireMutationRecord(
          await apiRequest<unknown>({
            method: definition.update!.method,
            path: definition.update!.path(encodeURIComponent(id)),
            operationId: definition.update!.operationId,
            body: input,
            signal: options?.signal,
          }),
          definition.update!.operationId,
        )
        : undefined,
      delete: definition.remove
        ? async (ids, options) => {
          await Promise.all(ids.map((id) => apiRequest({
            method: definition.remove!.method,
            path: definition.remove!.path(encodeURIComponent(id)),
            operationId: definition.remove!.operationId,
            signal: options?.signal,
          })));
        }
        : undefined,
      executeAction: definition.actions?.length
        ? async (actionId, input) => {
          const action = definition.actions?.find((candidate) => (
            candidate.operationId === actionId || sdkActionId(candidate.operationId) === actionId
          ));
          const id = input.ids[0];
          if (!action || id === undefined || input.ids.length !== 1) {
            throw new Error(`Markets detail action ${actionId} requires one known resource UID.`);
          }
          const query = action.method === "GET" && isRecord(input.payload)
            ? normalizeQueryValues(input.payload)
            : undefined;
          return apiRequest({
            method: action.method,
            path: action.path(encodeURIComponent(id)),
            operationId: action.operationId,
            query,
            body: action.method === "DELETE" || action.method === "GET" ? undefined : input.payload,
            signal: input.signal,
          });
        }
        : undefined,
    },
  });
}

export function createCanonicalMarketsResourceAdapter(input: {
  listPath: string;
  listOperationId: MarketsOperationId;
  detailPath?: (id: string) => string;
  detailOperationId?: MarketsOperationId;
}): ResourceAdapter<ApiRecord, string> {
  const discoveryPath = resourceDiscoveryPath(input.listPath);
  const client: ResourceHttpClient = {
    request: <Response,>(request: {
      method: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
      path: string;
      query?: Readonly<Record<string, unknown>>;
      body?: unknown;
      signal?: AbortSignal;
    }) => apiRequest<Response>({
      method: request.method,
      path: request.path,
      query: normalizeQueryValues(request.query),
      body: request.body,
      signal: request.signal,
      operationId: request.path === input.listPath
        ? input.listOperationId
        : request.method === "GET" && request.path !== discoveryPath && input.detailPath
          ? input.detailOperationId
          : undefined,
    }),
  };

  return createHttpResourceAdapter<
    ApiRecord,
    string,
    ResourceListResult<ApiRecord>,
    ApiRecord
  >({
    client,
    endpoints: {
      list: input.listPath,
      discovery: discoveryPath,
      detail: input.detailPath,
    },
    normalizeList: (response) => response,
    normalizeItem: (response) => response,
    serializeListQuery: serializeMarketsListQuery,
  });
}

export function serializeMarketsListQuery(
  request: ResourceListRequest,
): Readonly<Record<string, QueryValue>> {
  return {
    ...normalizeQueryValues(request.filters),
    limit: request.pageSize,
    offset: request.pageIndex * request.pageSize,
    search: request.search,
    ordering: serializeOrdering(request),
  };
}

export function resourceDiscoveryPath(listPath: string): string {
  return `${listPath.endsWith("/") ? listPath : `${listPath}/`}discovery/`;
}

export function sdkActionId(operationId: string): string {
  return sdkIdentifier(operationId);
}

export function sdkResourceColumnId(field: string): string {
  return sdkIdentifier(field);
}

function sdkIdentifier(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeQueryValues(
  values: Readonly<Record<string, unknown>> | undefined,
): Record<string, QueryValue> | undefined {
  if (!values) return undefined;
  return Object.fromEntries(Object.entries(values).map(([key, value]) => {
    if (value === null || value === undefined || ["string", "number", "boolean"].includes(typeof value)) {
      return [key, value as QueryValue];
    }
    throw new Error(`Markets resource query value ${key} must be a scalar.`);
  }));
}

function serializeOrdering(request: ResourceListRequest): string | undefined {
  if (!request.sort?.length) return undefined;
  return request.sort
    .map((sort) => `${sort.direction === "descending" ? "-" : ""}${sort.key}`)
    .join(",");
}

function requireRecordUid(record: ApiRecord): string {
  const uid = record.uid;
  if (typeof uid === "string" && uid.length > 0) return uid;
  if (typeof uid === "number") return String(uid);
  throw new Error("Markets resources must expose their canonical public uid.");
}

function requireMutationRecord(value: unknown, operationId: string): ApiRecord {
  if (isRecord(value)) return value;
  throw new Error(`${operationId} returned a non-object response for a resource mutation.`);
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
