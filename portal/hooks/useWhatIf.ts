"use client";

import { useState } from "react";
import { postWhatIf } from "@/lib/api";
import type { PropertyInput, WhatIfResponse } from "@/lib/types";

interface State {
  data: WhatIfResponse | null;
  loading: boolean;
  error: string | null;
}

export function useWhatIf() {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
  });

  async function runWhatIf(input: PropertyInput) {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await postWhatIf(input);
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "What-if analysis failed",
      });
    }
  }

  return { ...state, runWhatIf };
}
