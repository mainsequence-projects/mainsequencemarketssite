import { AlertTriangle, Braces, Check, Play, X } from "lucide-react";
import { useState } from "react";

export function OperationDialog({
  open,
  title,
  description,
  operationId,
  initialValue,
  operationKind = "mutation",
  destructive = false,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  description: string;
  operationId: string;
  initialValue?: unknown;
  operationKind?: "mutation" | "query";
  destructive?: boolean;
  onClose: () => void;
  onSubmit: (body: unknown) => Promise<void>;
}) {
  const [value, setValue] = useState(() => JSON.stringify(initialValue ?? {}, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;
  const needsBody = initialValue !== undefined;
  const isQuery = operationKind === "query";

  async function submit() {
    let body: unknown = undefined;
    if (needsBody) {
      try {
        body = JSON.parse(value);
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : "The request input is not valid JSON.");
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(body);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <section className="dialog" role="dialog" aria-modal="true" aria-labelledby="operation-title">
        <header className="dialog-header">
          <div className="dialog-icon" data-destructive={destructive || undefined}>
            {destructive ? <AlertTriangle size={18} /> : isQuery ? <Play size={18} /> : <Braces size={18} />}
          </div>
          <div>
            <p className="eyebrow">{isQuery ? "API operation" : "API mutation"}</p>
            <h2 id="operation-title">{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} disabled={submitting} aria-label="Close">
            <X size={17} />
          </button>
        </header>
        <p className="dialog-description">{description}</p>
        <code className="operation-id">{operationId}</code>
        {needsBody ? (
          <label className="field">
            <span>{isQuery ? "JSON operation input" : "JSON request body"}</span>
            <textarea
              className="json-editor"
              value={value}
              spellCheck={false}
              onChange={(event) => setValue(event.target.value)}
            />
          </label>
        ) : destructive ? (
          <p className="danger-copy">This operation changes persisted Markets data and cannot be undone from this application.</p>
        ) : (
          <p className="dialog-description">This operation does not require additional input.</p>
        )}
        {error ? <p className="inline-error" role="alert">{error}</p> : null}
        <footer className="dialog-actions">
          <button className="button ghost" type="button" onClick={onClose} disabled={submitting}>Cancel</button>
          <button
            className={destructive ? "button danger-button" : "button"}
            type="button"
            onClick={() => void submit()}
            disabled={submitting}
          >
            <Check size={15} /> {submitting ? "Submitting…" : isQuery ? "Run operation" : title}
          </button>
        </footer>
      </section>
    </div>
  );
}
