// Shared between server and client code. No `any`.

export interface PropertyInput {
  square_footage: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  lot_size: number;
  distance_to_city_center: number;
  school_rating: number;
}

// property-backend responses
export interface EstimateResponse {
  estimate_id: string;
  predicted_price: number;
  inputs: PropertyInput;
  timestamp: string;
}

export interface HistoryResponse {
  items: EstimateResponse[];
  total: number;
}

export interface CompareItem {
  index: number;
  predicted_price: number;
  inputs: PropertyInput;
}

export interface CompareResponse {
  comparisons: CompareItem[];
}

// market-backend responses
export interface MarketSummary {
  count: number;
  mean: number;
  min: number;
  max: number;
  median: number;
  stdDev: number;
}

export interface SegmentStats {
  group: string;
  count: number;
  mean: number;
  min: number;
  max: number;
  median: number;
}

export interface SegmentsResponse {
  groupBy: string;
  segments: SegmentStats[];
}

export interface AnalysisResponse {
  filters: Record<string, string>;
  count: number;
  mean: number;
  min: number;
  max: number;
  median: number;
  stdDev: number;
}

export interface WhatIfResponse {
  predictedPrice: number;
  percentile: number;
  marketPosition: string;
  marketSummary: MarketSummary;
}

export interface ApiError {
  error: string;
  detail: string;
  timestamp: string;
}
