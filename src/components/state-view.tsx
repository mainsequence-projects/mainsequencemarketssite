import { AlertTriangle, Inbox, LoaderCircle, RefreshCw, ShieldAlert } from "lucide-react";

import { ApiError } from "@/lib/api/client";

export function LoadingState({ label = "Loading Markets data" }: { label?: string }) {
  return (
    <div className="state-view" role="status" aria-live="polite">
      <LoaderCircle className="spin" aria-hidden="true" />
      <strong>{label}</strong>
      <span>Requesting the deployed Markets API.</span>
    </div>
  );
}

export function EmptyState({ title = "No records found", description }: {
  title?: string;
  description: string;
}) {
  return (
    <div className="state-view">
      <Inbox aria-hidden="true" />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const unauthorized = error instanceof ApiError && (error.status === 401 || error.status === 403);
  const Icon = unauthorized ? ShieldAlert : AlertTriangle;
  return (
    <div className="state-view state-error" role="alert">
      <Icon aria-hidden="true" />
      <strong>{unauthorized ? "Access unavailable" : "Markets API request failed"}</strong>
      <span>{error.message}</span>
      {error instanceof ApiError && error.operationId ? (
        <code>operationId: {error.operationId}</code>
      ) : null}
      {onRetry ? (
        <button className="button secondary" type="button" onClick={onRetry}>
          <RefreshCw size={14} /> Retry
        </button>
      ) : null}
    </div>
  );
}
