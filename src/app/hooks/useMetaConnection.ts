import { useCallback, useEffect, useState } from 'react';
import { getMetaStatus, type MetaConnection } from '../lib/api/meta';

export function useMetaConnection() {
  const [connection, setConnection] = useState<MetaConnection | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMetaStatus();
      setConnected(res.connected);
      setConnection(res.connection);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load Meta status';
      setError(message);
      setConnected(false);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  return { connection, connected, loading, error, refresh };
}
