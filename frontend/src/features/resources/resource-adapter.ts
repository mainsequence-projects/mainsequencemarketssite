import {
  createHttpResourceAdapter,
  defineResourceApplication,
  type ResourceApplicationDefinition,
  type ResourceBulkActionDefinition,
  type ResourceCollectionControls,
  type ResourceHttpClient,
  type ResourceListRequest,
  type ResourceListResult,
} from "@dev-mainsequence/command-center-sdk/resource";

import type { ResourceDefinition } from "@/features/resources/resource-definitions";
import { apiRequest, type QueryValue } from "@/lib/api/client";
import {
  normalizeCollection,
  recordUid,
  type ApiRecord,
  type CollectionResponse,
  type PaginatedResponse,
} from "@/lib/api/types";

export type MarketsResourceApplication = ResourceApplicationDefinition<ApiRecord, string>;

export function createMarketsResourceApplication(
  definition: ResourceDefinition,
): MarketsResourceApplication {
  const bulkAction = definition.bulkRemove
    ? createBulkAction(definition)
    : null;
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
      operationId: request.path === definition.listPath
        ? definition.listOperationId
        : definition.detailOperationId,
    }),
  };
  const httpAdapter = createHttpResourceAdapter<
    ApiRecord,
    string,
    CollectionResponse<ApiRecord>,
    ApiRecord
  >({
    client,
    endpoints: {
      list: definition.listPath,
      detail: definition.detailPath
        ? (id) => definition.detailPath!(encodeURIComponent(id))
        : undefined,
    },
    normalizeList: (response, request) => normalizeMarketsCollection(
      response,
      request,
      collectionControls(definition),
      bulkAction ? [bulkAction] : undefined,
    ),
    normalizeItem: (response) => response,
    serializeListQuery: (request) => serializeMarketsListQuery(definition, request),
  });

  return defineResourceApplication({
    id: definition.id,
    label: definition.title,
    itemLabel: definition.title.toLocaleLowerCase(),
    description: definition.description,
    getId: requireRecordUid,
    columns: definition.columns.map((column) => ({
      id: column.key,
      header: column.label,
      getValue: (resource) => resource[column.key],
      sortableKey: column.key,
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
        requiresConfirmation: true,
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
      executeBulkAction: bulkAction && definition.bulkRemove
        ? async (action, input) => {
          if (action.id !== bulkAction.id || input.selection.mode !== "explicit") {
            throw new Error("This Markets bulk action requires an explicit UID selection.");
          }
          return apiRequest({
            method: definition.bulkRemove!.method,
            path: definition.bulkRemove!.path(""),
            operationId: definition.bulkRemove!.operationId,
            body: { uids: input.selection.uids },
            signal: input.signal,
          });
        }
        : undefined,
    },
  });
}

export function serializeMarketsListQuery(
  definition: ResourceDefinition,
  request: ResourceListRequest,
): Readonly<Record<string, QueryValue>> {
  return {
    ...definition.defaultQuery,
    limit: request.pageSize,
    offset: request.pageIndex * request.pageSize,
    search: definition.searchable === false ? undefined : request.search,
    ...normalizeQueryValues(request.filters),
    ordering: request.sort?.length
      ? request.sort.map((sort) => `${sort.direction === "descending" ? "-" : ""}${sort.key}`).join(",")
      : undefined,
  };
}

export function normalizeMarketsCollection(
  response: CollectionResponse<ApiRecord>,
  request: ResourceListRequest,
  controls?: ResourceCollectionControls,
  bulkActions?: readonly ResourceBulkActionDefinition[],
): ResourceListResult<ApiRecord> {
  const collection = normalizeCollection(response);
  const paginated = isPaginatedResponse(response) ? response : null;
  const loadedThrough = request.pageIndex * request.pageSize + collection.rows.length;

  return {
    items: collection.rows,
    pageInfo: {
      pageIndex: request.pageIndex,
      pageSize: request.pageSize,
      totalItems: collection.count,
      hasNextPage: paginated ? paginated.next !== null : loadedThrough < collection.count,
      hasPreviousPage: paginated ? paginated.previous !== null : request.pageIndex > 0,
    },
    controls,
    bulkActions,
  };
}

function collectionControls(definition: ResourceDefinition): ResourceCollectionControls {
  return {
    search: definition.searchable === false ? null : {
      placeholder: `Search ${definition.title.toLowerCase()}`,
      fields: definition.columns.map((column) => column.key),
    },
    filters: (definition.filters ?? []).map((filter) => ({
      key: filter.key,
      label: filter.label,
      type: "text" as const,
    })),
    ordering: definition.columns.map((column) => column.key),
  };
}

function createBulkAction(definition: ResourceDefinition): ResourceBulkActionDefinition {
  const mutation = definition.bulkRemove!;
  if (mutation.method !== "POST") {
    throw new Error(`${mutation.operationId} must use POST to participate in SDK bulk actions.`);
  }
  return {
    id: sdkActionId(mutation.operationId),
    label: mutation.label,
    endpoint: mutation.path(""),
    method: "POST",
    tone: "danger",
    selection_modes: ["explicit"],
    confirmation: {
      title: mutation.label,
      word: "DELETE",
      button_label: mutation.label,
      warning: mutation.description,
    },
    options: [],
  };
}

export function sdkActionId(operationId: string): string {
  return operationId
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

function requireRecordUid(record: ApiRecord): string {
  const uid = recordUid(record);
  if (!uid) throw new Error("Markets resources must expose a stable uid, id, identifier, or set key.");
  return uid;
}

function requireMutationRecord(value: unknown, operationId: string): ApiRecord {
  if (isRecord(value)) return value;
  throw new Error(`${operationId} returned a non-object response for a resource mutation.`);
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPaginatedResponse(
  response: CollectionResponse<ApiRecord>,
): response is PaginatedResponse<ApiRecord> {
  return !Array.isArray(response) && "results" in response && Array.isArray(response.results);
}
