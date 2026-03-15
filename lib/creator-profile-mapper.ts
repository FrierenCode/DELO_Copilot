/**
 * Maps PRD onboarding wizard values to the existing backend creator-profile schema.
 *
 * The PRD uses different band labels than the backend FollowersBand / AvgViewsBand
 * enums. This module is the single source of truth for those conversions.
 *
 * Mapping strategy: positional 1-to-1 (PRD options ordered low→high,
 * backend values ordered low→high). No DB migrations needed.
 *
 * Backend enums (DO NOT change — mirrors services/quote-engine.ts):
 *   FollowersBand: under_10k | 10k_50k | 50k_100k | 100k_500k | over_500k
 *   AvgViewsBand:  under_5k  | 5k_20k  | 20k_50k  | over_50k
 */

export type PrdOnboardingData = {
  /** "youtube" | "tiktok" | "instagram" */
  primary_platform: string;
  /** "beauty" | "gaming" | "lifestyle" | "tech" | "food" */
  niche: string;
  /** PRD audience band key — see AUDIENCE_MAP below */
  audience_band: string;
  /** PRD avg-views band key — see AVG_VIEWS_MAP below */
  avg_views_band: string;
  /** "korea" | "english" | "other" */
  geo_region: string;
  /** positive integer, KRW */
  floor_rate: number;
};

// PRD audience band → backend FollowersBand
//   under_10k   → under_10k   (exact match)
//   10k_50k     → 10k_50k     (exact match)
//   50k_150k    → 50k_100k    (PRD range starts at 50k; closest lower backend band)
//   150k_300k   → 100k_500k   (150k–300k falls within 100k–500k backend band)
//   300k_plus   → over_500k   (300k+ → highest backend band)
const AUDIENCE_MAP: Record<string, string> = {
  under_10k: "under_10k",
  "10k_50k": "10k_50k",
  "50k_150k": "50k_100k",
  "150k_300k": "100k_500k",
  "300k_plus": "over_500k",
};

// PRD avg-views band → backend AvgViewsBand (positional 1:1)
//   under_10k  → under_5k   (lowest PRD band → lowest backend band)
//   10k_50k    → 5k_20k     (2nd PRD band → 2nd backend band)
//   50k_150k   → 20k_50k    (3rd PRD band → 3rd backend band)
//   150k_plus  → over_50k   (highest PRD band → highest backend band)
const AVG_VIEWS_MAP: Record<string, string> = {
  under_10k: "under_5k",
  "10k_50k": "5k_20k",
  "50k_150k": "20k_50k",
  "150k_plus": "over_50k",
};

// PRD geo label → backend geo_region value
const GEO_MAP: Record<string, string> = {
  korea: "KR",
  english: "EN",
  other: "OTHER",
};

/**
 * Converts PRD wizard selections into the shape expected by
 * POST/PUT /api/creator-profile.
 *
 * Falls back to sensible defaults if an unknown key is passed
 * (should not happen in normal flow).
 */
export function mapToApiProfile(data: PrdOnboardingData) {
  return {
    primary_platform: data.primary_platform,
    niche: data.niche,
    followers_band: AUDIENCE_MAP[data.audience_band] ?? "50k_100k",
    avg_views_band: AVG_VIEWS_MAP[data.avg_views_band] ?? "20k_50k",
    geo_region: GEO_MAP[data.geo_region] ?? "KR",
    floor_rate: data.floor_rate,
    currency: "KRW",
  };
}
