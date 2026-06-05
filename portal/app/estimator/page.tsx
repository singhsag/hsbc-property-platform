// force-dynamic: page fetches live backend data — must not be statically rendered at build time
export const dynamic = "force-dynamic";

import { serverGetMarketSummary } from "@/lib/api";
import { EstimatorClient } from "./EstimatorClient";

export default async function EstimatorPage() {
  const marketSummary = await serverGetMarketSummary();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Property Value Estimator
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Enter property details to receive an ML-powered price estimate.
      </p>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <EstimatorClient marketSummary={marketSummary} />
      </div>
    </div>
  );
}
