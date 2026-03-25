import type { QuoteResult } from "@/services/quote-engine";

export type DealStatus =
  | "Lead"
  | "Replied"
  | "Negotiating"
  | "Confirmed"
  | "Delivered"
  | "Paid"
  | "ClosedLost";

export type Deal = {
  id: string;
  user_id: string;
  inquiry_id?: string;

  brand_name: string;
  contact_name: string;
  contact_channel: string;
  platform_requested: string;
  deliverables_summary: string;
  budget_mentioned: string;

  quote_floor: number;
  quote_target: number;
  quote_premium: number;
  quote_breakdown_json: QuoteResult;

  deadline?: string;
  payment_due_date?: string;

  next_action: string;
  next_action_due_at: string;

  followup_needed: boolean;
  unresolved_checks_count: number;

  status: DealStatus;
  notes?: string;
  memo?: string | null;

  created_at: string;
  updated_at: string;
  notified_at?: string | null;
};

export type DealInsert = Omit<Deal, "id" | "created_at" | "updated_at">;
export type DealUpdate = Partial<Omit<DealInsert, "user_id">>;

export type DealCheck = {
  id: string;
  deal_id: string;
  type: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  resolved: boolean;
  created_at: string;
};

export type DealCheckInsert = Omit<DealCheck, "id" | "created_at">;

export type DealStatusLog = {
  id: string;
  deal_id: string;
  from_status: DealStatus;
  to_status: DealStatus;
  created_at: string;
};

export type DealStatusLogInsert = Omit<DealStatusLog, "id" | "created_at">;

// DB table name: reply_drafts (distinct from the in-memory ReplyDrafts type)
export type ReplyDraftRecord = {
  id: string;
  deal_id: string;
  tone: "polite" | "negotiation" | "quick";
  body: string;
  created_at: string;
};

export type ReplyDraftInsert = Omit<ReplyDraftRecord, "id" | "created_at">;
