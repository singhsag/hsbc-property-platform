"use client";

import { useState } from "react";
import { postEstimate } from "@/lib/api";
import type { EstimateResponse, PropertyInput } from "@/lib/types";

interface State {
  data: EstimateResponse | null;
  loading: boolean;
  error: string | null;
}

export function usePrediction() {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  async function predict(input: PropertyInput) {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await postEstimate(input);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prediction failed";
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }

  return { ...state, predict };
}
