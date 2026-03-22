export type ParsedInquiry = {
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

export type QuoteBreakdown = {
  target: number;
  explanation: string;
  base_fee?: number;
  floor?: number;
  premium?: number;
};

export type CheckItem = {
  check_code: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  resolved: boolean;
};

export type ReplyDrafts = {
  polite: string;
  quick: string | null;
  negotiation: string | null;
};

export type InquirySummary = {
  id: string;
  brand: string;
  platform: string;
  contact_channel: string;
  deliverables: string;
  suggested_price: number | null;
  created_at: string;
};

export type ParseApiResult = {
  inquiry_id: string;
  parsed_json: ParsedInquiry;
  quote_breakdown: QuoteBreakdown;
  checks: CheckItem[];
  missing_fields: string[];
  reply_drafts: ReplyDrafts;
  reply_meta: {
    negotiation_ai_available: boolean;
  };
  /** ISO date string from the inquiries table */
  created_at?: string | null;
  /** First 200 chars of raw input text */
  raw_text_preview?: string | null;
};
