import type { FollowersBand, AvgViewsBand } from "@/services/quote-engine";

export type InquiryData = {
  brand_name: string;
  contact_name: string;
  contact_channel: string;
  platform_requested: string;
  deliverables: string;
  timeline: string;
  compensation_type: string;
  budget_mentioned: string;
  usage_rights: string;
  exclusivity: string;
  revisions: string;
  payment_terms: string;
};

export type CreatorProfile = {
  followers_band: FollowersBand;
  avg_views_band: AvgViewsBand;
  niche: string;
  floor_rate: number;
};

export type ParseInput = {
  raw_text: string;
  source_type: "email" | "dm" | "other";
};

export type ParseResult = {
  parsed_json: InquiryData;
  missing_fields: string[];
};
