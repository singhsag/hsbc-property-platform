"use client";

import { useCallback, useState } from "react";
import { getHistory } from "@/lib/api";
import type { HistoryResponse } from "@/lib/types";

export function useHistory(initialLimit = 20) {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (limit = initialLimit) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHistory(limit);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
      return null;
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  return { data, loading, error, refresh };
}
