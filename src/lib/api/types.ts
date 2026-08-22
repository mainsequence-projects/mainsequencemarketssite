export type ApiRecord = Record<string, unknown>;

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
