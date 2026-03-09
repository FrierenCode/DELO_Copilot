import type { CreatorProfile, InquiryData } from "@/types/inquiry";

export type FollowersBand = "under_10k" | "10k_50k" | "50k_100k" | "100k_500k" | "over_500k";
export type AvgViewsBand = "under_5k" | "5k_20k" | "20k_50k" | "over_50k";

export type QuoteInput = {
  creator_profile: CreatorProfile;
  inquiry: InquiryData;
};

export type QuoteResult = {
  base_fee: number;
  usage_rights_fee: number;
  exclusivity_fee: number;
  rush_fee: number;
  floor: number;
  target: number;
  premium: number;
  explanation: string;
};

const BASE_FEE_MAP: Record<FollowersBand, number> = {
  under_10k: 200000,
  "10k_50k": 350000,
  "50k_100k": 550000,
  "100k_500k": 900000,
  over_500k: 1500000,
};

const FOLLOWERS_BAND_LABEL: Record<FollowersBand, string> = {
  under_10k: "under 10k",
  "10k_50k": "10k~50k",
  "50k_100k": "50k~100k",
  "100k_500k": "100k~500k",
  over_500k: "over 500k",
};

const AVG_VIEWS_LABEL: Record<AvgViewsBand, string> = {
  under_5k: "under 5k",
  "5k_20k": "5k~20k",
  "20k_50k": "20k~50k",
  over_50k: "over 50k",
};

function timelineDays(timeline: string): number {
  const match = timeline.match(/(\d+)\s*(day|week|month)/i);
  if (!match) return 14;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  if (unit.startsWith("week")) return n * 7;
  if (unit.startsWith("month")) return n * 30;
  return n;
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const { creator_profile, inquiry } = input;

  const base_fee = BASE_FEE_MAP[creator_profile.followers_band];
  const usage_rights_fee = inquiry.usage_rights !== "not specified" ? 200000 : 0;
  const exclusivity_fee = inquiry.exclusivity !== "not specified" ? 150000 : 0;
  const rush_fee = timelineDays(inquiry.timeline) < 7 ? 100000 : 0;

  const target = base_fee + usage_rights_fee + exclusivity_fee + rush_fee;
  const calculatedFloor = Math.round(target * 0.8);
  const floor = Math.max(calculatedFloor, creator_profile.floor_rate);
  const premium = Math.round(target * 1.5);

  const followersLabel = FOLLOWERS_BAND_LABEL[creator_profile.followers_band];
  const viewsLabel = AVG_VIEWS_LABEL[creator_profile.avg_views_band];

  const extras: string[] = [];
  if (usage_rights_fee > 0) extras.push("usage rights");
  if (exclusivity_fee > 0) extras.push("exclusivity");
  if (rush_fee > 0) extras.push("rush delivery");

  const extrasNote = extras.length > 0 ? ` with ${extras.join(", ")}` : "";
  const explanation =
    `Based on ${followersLabel} followers and ${viewsLabel} avg views in ${creator_profile.niche} niche${extrasNote}.`;

  return {
    base_fee,
    usage_rights_fee,
    exclusivity_fee,
    rush_fee,
    floor,
    target,
    premium,
    explanation,
  };
}
