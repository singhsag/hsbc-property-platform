"use client";

import { EstimatorForm } from "@/components/EstimatorForm";
import { PredictionResult } from "@/components/PredictionResult";
import { usePrediction } from "@/hooks/usePrediction";
import type { MarketSummary, PropertyInput } from "@/lib/types";

interface Props {
  marketSummary: MarketSummary;
}

export function EstimatorClient({ marketSummary }: Props) {
  const { data, loading, error, predict } = usePrediction();

  async function handleSubmit(input: PropertyInput) {
    await predict(input);
  }

  return (
    <>
      <EstimatorForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <p
          className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {data && <PredictionResult result={data} marketSummary={marketSummary} />}
    </>
  );
}
