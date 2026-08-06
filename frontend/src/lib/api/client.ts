import { loadRuntimeConfiguration } from "@/config/runtime";
import type { MarketsOperationId } from "@/lib/api/contracts";

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
  const url = resolveApiUrl(input.path, input.query);
  const hasBody = input.body !== undefined;
  let response: Response;
  try {
    response = await fetch(url, {
      method: input.method,
      credentials: "include",
      headers: {
        accept: "application/json",
        ...(hasBody ? { "content-type": "application/json" } : {}),
      },
      body: hasBody ? JSON.stringify(input.body) : undefined,
      cache: "no-store",
      signal: input.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(
      "The Markets API could not be reached. Check the configured origin and CORS allowlist.",
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
  const normalizedPath = normalizePath(path);
  const origin = rawBaseUrl
    ? loadRuntimeConfiguration({ apiBaseUrl: rawBaseUrl, embedded: false }).apiOrigin
    : loadRuntimeConfiguration().apiOrigin;
  const url = new URL(normalizedPath, origin);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
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
