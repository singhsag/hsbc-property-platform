"use client";

import { useCallback, useState } from "react";
import { getAnalysis, getSegments } from "@/lib/api";
import type { AnalysisResponse, SegmentsResponse } from "@/lib/types";

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
}

export function useMarketData() {
  const [segments, setSegments] = useState<SegmentsResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSegments = useCallback(async (groupBy = "bedrooms") => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSegments(groupBy);
      setSegments(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load segments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalysis = useCallback(async (filters: Filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalysis(filters);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, []);

  return { segments, analysis, loading, error, fetchSegments, fetchAnalysis };
}
