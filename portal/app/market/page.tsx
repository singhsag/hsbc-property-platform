// force-dynamic: page fetches live backend data — must not be statically rendered at build time
export const dynamic = "force-dynamic";

import { serverGetMarketSummary } from "@/lib/api";
import { MarketDashboard } from "@/components/MarketDashboard";
import { WhatIfTool } from "@/components/WhatIfTool";

export default async function MarketPage() {
  const summary = await serverGetMarketSummary();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Property Market Analysis
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Live statistics from the property dataset with interactive filtering.
      </p>

      <MarketDashboard summary={summary} />

      <div className="mt-10">
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          What-If Analysis
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Estimate a property value and see where it sits in the market
          distribution.
        </p>
        <div className="mx-auto max-w-2xl">
          <WhatIfTool />
        </div>
      </div>
    </div>
  );
}
