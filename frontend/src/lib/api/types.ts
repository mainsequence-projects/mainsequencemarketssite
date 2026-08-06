export type ApiRecord = Record<string, unknown>;

export type PaginatedResponse<T extends ApiRecord = ApiRecord> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type CollectionResponse<T extends ApiRecord = ApiRecord> =
  | T[]
  | PaginatedResponse<T>
  | { items?: T[]; data?: T[]; count?: number };

export function normalizeCollection<T extends ApiRecord>(value: CollectionResponse<T>): {
  rows: T[];
  count: number;
} {
  if (Array.isArray(value)) return { rows: value, count: value.length };
  if ("results" in value && Array.isArray(value.results)) {
    return { rows: value.results, count: value.count };
  }
  const rows = "items" in value && Array.isArray(value.items)
    ? value.items
    : "data" in value && Array.isArray(value.data)
      ? value.data
      : [];
  return { rows, count: typeof value.count === "number" ? value.count : rows.length };
}

export function recordUid(record: ApiRecord): string | null {
  for (const key of ["uid", "id", "unique_identifier", "set_key"]) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

export function formatCellValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return new Intl.NumberFormat().format(value);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
