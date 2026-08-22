import { useCallback, useEffect, useState } from "react";

export type QueryState<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
  reload: () => void;
};

export function useApiQuery<T>(
  key: string,
  query: (signal: AbortSignal) => Promise<T>,
): QueryState<T> {
  const [revision, setRevision] = useState(0);
  const requestKey = `${key}:${revision}`;
  const [state, setState] = useState<Omit<QueryState<T>, "reload"> & { requestKey: string | null }>({
    data: null,
    error: null,
    loading: true,
    requestKey: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    void query(controller.signal).then(
      (data) => setState({ data, error: null, loading: false, requestKey }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
          requestKey,
        });
      },
    );
    return () => controller.abort();
  }, [query, requestKey]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const loading = state.requestKey !== requestKey || state.loading;
  return {
    data: loading ? null : state.data,
    error: loading ? null : state.error,
    loading,
    reload,
  };
}
