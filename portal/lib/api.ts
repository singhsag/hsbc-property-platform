import type {
  AnalysisResponse,
  CompareResponse,
  EstimateResponse,
  HistoryResponse,
  MarketSummary,
  PropertyInput,
  SegmentsResponse,
  WhatIfResponse,
} from "./types";

// Server components use internal Docker hostnames; client components use
// NEXT_PUBLIC_ vars pointing to localhost (browser can't reach Docker names).
const PROPERTY_URL =
  process.env.PROPERTY_BACKEND_URL ?? "http://localhost:8001";
const MARKET_URL =
  process.env.MARKET_BACKEND_URL ?? "http://localhost:8080";

export const CLIENT_PROPERTY_URL =
  process.env.NEXT_PUBLIC_PROPERTY_BACKEND_URL ?? "http://localhost:8001";
export const CLIENT_MARKET_URL =
  process.env.NEXT_PUBLIC_MARKET_BACKEND_URL ?? "http://localhost:8080";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Server-side calls (used in Server Components) ──────────────────────────

export async function serverGetMarketSummary(): Promise<MarketSummary> {
  return fetchJson<MarketSummary>(`${MARKET_URL}/api/market/summary`, {
    next: { revalidate: 300 },
  });
}

export async function serverGetSegments(
  groupBy = "bedrooms"
): Promise<SegmentsResponse> {
  return fetchJson<SegmentsResponse>(
    `${MARKET_URL}/api/market/segments?groupBy=${groupBy}`,
    { next: { revalidate: 300 } }
  );
}

export async function serverGetHistory(limit = 20): Promise<HistoryResponse> {
  return fetchJson<HistoryResponse>(
    `${PROPERTY_URL}/history?limit=${limit}`,
    { cache: "no-store" }
  );
}

// ── Client-side helpers (used in hooks, return full URL strings) ───────────

export function propertyUrl(path: string): string {
  return `${CLIENT_PROPERTY_URL}${path}`;
}

export function marketUrl(path: string): string {
  return `${CLIENT_MARKET_URL}${path}`;
}

// ── Typed client fetch wrappers ────────────────────────────────────────────

export async function postEstimate(
  input: PropertyInput
): Promise<EstimateResponse> {
  return fetchJson<EstimateResponse>(propertyUrl("/estimate"), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function postCompare(
  properties: PropertyInput[]
): Promise<CompareResponse> {
  return fetchJson<CompareResponse>(propertyUrl("/compare"), {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

export async function getHistory(limit = 20): Promise<HistoryResponse> {
  return fetchJson<HistoryResponse>(propertyUrl(`/history?limit=${limit}`));
}

export async function getMarketSummary(): Promise<MarketSummary> {
  return fetchJson<MarketSummary>(marketUrl("/api/market/summary"));
}

export async function getSegments(
  groupBy = "bedrooms"
): Promise<SegmentsResponse> {
  return fetchJson<SegmentsResponse>(
    marketUrl(`/api/market/segments?groupBy=${groupBy}`)
  );
}

export async function getAnalysis(params: {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
}): Promise<AnalysisResponse> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) qs.set(k, String(v));
  });
  return fetchJson<AnalysisResponse>(
    marketUrl(`/api/market/analysis?${qs.toString()}`)
  );
}

export async function postWhatIf(
  input: PropertyInput
): Promise<WhatIfResponse> {
  return fetchJson<WhatIfResponse>(marketUrl("/api/market/whatif"), {
    method: "POST",
    body: JSON.stringify({
      squareFootage: input.square_footage,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      yearBuilt: input.year_built,
      lotSize: input.lot_size,
      distanceToCityCenter: input.distance_to_city_center,
      schoolRating: input.school_rating,
    }),
  });
}
