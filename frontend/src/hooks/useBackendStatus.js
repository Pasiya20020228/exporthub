import { useCallback, useEffect, useState } from "react";
import { fetchBackendHealth, fetchBackendRoot } from "../services/api.js";

export function useBackendStatus() {
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rootResponse, healthResponse] = await Promise.all([
        fetchBackendRoot(),
        fetchBackendHealth(),
      ]);
      setStatus(rootResponse);
      setHealth(healthResponse);
    } catch (err) {
      console.error("Failed to fetch backend status", err);
      setError("Unable to reach the backend. Check the service logs.");
      setStatus(null);
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, health, isLoading, error, refresh };
}

export default useBackendStatus;
