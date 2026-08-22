import { loadRuntimeConfiguration } from "@/config/runtime";
import type { MarketsOperationId } from "@/lib/api/contracts";
import { getCommandCenterConnection } from "@/lib/embed/context";

export type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export type QueryValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown,
    readonly operationId?: MarketsOperationId,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(input: {
  method: ApiMethod;
  path: string;
  operationId?: MarketsOperationId;
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
}): Promise<T> {
  const configuration = loadRuntimeConfiguration();
  const path = resolveApiPath(input.path, input.query);
  const hasBody = input.body !== undefined;
  const requestInit: RequestInit = {
    method: input.method,
    headers: {
      accept: "application/json",
      ...(hasBody ? { "content-type": "application/json" } : {}),
    },
    body: hasBody ? JSON.stringify(input.body) : undefined,
    cache: "no-store",
    signal: input.signal,
  };
  let response: Response;
  try {
    if (configuration.embedded) {
      const connection = getCommandCenterConnection();
      if (!connection || !configuration.fastApiReleaseUid) {
        throw new Error("The delegated FastAPI iframe transport is not initialized.");
      }
      response = await connection.fetchFastApi({
        resourceReleaseUid: configuration.fastApiReleaseUid,
        path,
      }, requestInit);
    } else {
      response = await fetch(resolveApiUrl(path, {}, configuration.apiOrigin ?? undefined), {
        ...requestInit,
        credentials: "include",
      });
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      configuration.embedded
        ? "The delegated Markets API transport could not be established. Check release access and origin admission."
        : "The Markets API could not be reached. Check the configured origin and CORS allowlist.",
      0,
      { cause: error instanceof Error ? error.message : String(error) },
      input.operationId,
    );
  }

  const payload = await readResponsePayload(response);
  if (!response.ok) {
    const apiError = new ApiError(
      extractMessage(payload) ?? `Markets API request failed (${response.status}).`,
      response.status,
      payload,
      input.operationId,
    );
    throw apiError;
  }
  return payload as T;
}

export function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  options?: { signal?: AbortSignal; operationId?: MarketsOperationId },
): Promise<T> {
  return apiRequest({ method: "GET", path, query, ...options });
}

export function apiPost<T>(path: string, body: unknown, operationId?: MarketsOperationId): Promise<T> {
  return apiRequest({ method: "POST", path, body, operationId });
}

export function apiPatch<T>(path: string, body: unknown, operationId?: MarketsOperationId): Promise<T> {
  return apiRequest({ method: "PATCH", path, body, operationId });
}

export function apiDelete<T>(path: string, operationId?: MarketsOperationId): Promise<T> {
  return apiRequest({ method: "DELETE", path, operationId });
}

export function resolveApiUrl(
  path: string,
  query: Record<string, QueryValue> = {},
  rawBaseUrl?: string,
): string {
  const normalizedPath = resolveApiPath(path, query);
  const origin = rawBaseUrl
    ? loadRuntimeConfiguration({ apiBaseUrl: rawBaseUrl, embedded: false }).apiOrigin
    : loadRuntimeConfiguration().apiOrigin;
  if (!origin) throw new Error("A standalone API origin is required to resolve an absolute URL.");
  const url = new URL(normalizedPath, origin);
  return url.toString();
}

export function resolveApiPath(
  path: string,
  query: Record<string, QueryValue> = {},
): string {
  const normalizedPath = normalizePath(path);
  const url = new URL(normalizedPath, "https://markets.invalid");
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return `${url.pathname}${url.search}`;
}

function normalizePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API paths must be absolute paths on the configured Markets origin.");
  }
  if (path.split("/").includes("..")) throw new Error("API paths must not traverse directories.");
  return path;
}

async function readResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractMessage(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return null;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (!Array.isArray(detail)) return null;
  const messages = detail.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const issue = item as { loc?: unknown; msg?: unknown };
    if (typeof issue.msg !== "string") return [];
    const location = Array.isArray(issue.loc) ? issue.loc.join(".") : "request";
    return [`${location}: ${issue.msg}`];
  });
  return messages.length ? messages.join("; ") : null;
}
