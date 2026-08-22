import { formatCellValue, type ApiRecord } from "@/lib/api/types";

export function ApiRecordView({ value }: { value: unknown }) {
  if (!isRecord(value)) return <pre className="json-view">{JSON.stringify(value, null, 2)}</pre>;
  const entries = Object.entries(value);
  return (
    <div className="record-view">
      {entries.map(([key, item]) => (
        <div className="record-field" key={key}>
          <dt>{humanize(key)}</dt>
          <dd>
            {isPrimitive(item)
              ? formatCellValue(item)
              : <pre>{JSON.stringify(item, null, 2)}</pre>}
          </dd>
        </div>
      ))}
    </div>
  );
}

function humanize(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function isPrimitive(value: unknown): value is string | number | boolean | null | undefined {
  return value == null || ["string", "number", "boolean"].includes(typeof value);
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
