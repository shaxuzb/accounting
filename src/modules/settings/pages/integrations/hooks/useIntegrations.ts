import { useCallback, useEffect, useState } from "react";
import { integrationService } from "../services/integrationService";
import type { IntegrationRecord } from "../types/type";

export function useIntegrations() {
  const [items, setItems] = useState<IntegrationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await integrationService.list());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void integrationService
      .list()
      .then((records) => {
        if (active) {
          setItems(records);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : String(cause));
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { items, isLoading, error, refresh };
}
