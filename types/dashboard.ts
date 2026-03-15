// Client-safe dashboard types — no imports from server-only modules.
// These mirror the alert-engine types structurally so the server-component
// data can be passed directly to client components without casts.

import type { Deal, DealCheck, DealStatusLog, ReplyDraftRecord } from "@/types/deal";

export type AlertItemType =
  | "overdue_followup"
  | "payment_overdue"
  | "deadline_soon"
  | "unresolved_checks";

export type AlertItem = {
  type: AlertItemType;
  deal_id: string;
  brand_name: string;
  /** DealStatus value at alert time */
  status: string;
  title: string;
  message: string;
  severity: "high" | "medium";
  due_at: string | null;
};

export type AlertResult = {
  overdue_followups: number;
  payment_overdue: number;
  deadline_soon: number;
  unresolved_checks: number;
  items: AlertItem[];
};

export type DashboardDealsData = {
  alerts: AlertResult;
  deals: Deal[];
};

export type DealDetailData = {
  deal: Deal;
  checks: DealCheck[];
  drafts: ReplyDraftRecord[];
  status_logs: DealStatusLog[];
};
