// force-dynamic: history is mutable — do not statically cache at build time
export const dynamic = "force-dynamic";

import { serverGetHistory } from "@/lib/api";
import { HistoryClient } from "./HistoryClient";

export default async function HistoryPage() {
  const initial = await serverGetHistory(20);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Estimate History
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Recent property estimates. Stored in-memory — refreshes on restart.
      </p>
      <HistoryClient initial={initial} />
    </div>
  );
}
