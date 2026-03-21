import "server-only";

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
  under_10k: "1만 미만",
  "10k_50k": "1만~5만",
  "50k_100k": "5만~10만",
  "100k_500k": "10만~50만",
  over_500k: "50만 이상",
};

const AVG_VIEWS_LABEL: Record<AvgViewsBand, string> = {
  under_5k: "5천 미만",
  "5k_20k": "5천~2만",
  "20k_50k": "2만~5만",
  over_50k: "5만 이상",
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
  if (usage_rights_fee > 0) extras.push("콘텐츠 사용권");
  if (exclusivity_fee > 0) extras.push("독점 조항");
  if (rush_fee > 0) extras.push("긴급 납품");

  const extrasNote = extras.length > 0 ? ` / ${extras.join(", ")} 포함` : "";
  const explanation =
    `팔로워 ${followersLabel}, 평균 조회수 ${viewsLabel} ${creator_profile.niche} 채널 기준${extrasNote}.`;

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
