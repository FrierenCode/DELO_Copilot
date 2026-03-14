import "server-only";

import type { Deal, DealStatus } from "@/types/deal";

export type AlertSummary = {
  overdue_followups: number;
  payment_overdue: number;
  deadline_soon: number;
  unresolved_checks: number;
};

export type AlertItemType =
  | "overdue_followup"
  | "payment_overdue"
  | "deadline_soon"
  | "unresolved_checks";

export type AlertItem = {
  type: AlertItemType;
  deal_id: string;
  brand_name: string;
  status: DealStatus;
  title: string;
  message: string;
  severity: "high" | "medium";
  due_at: string | null;
};

export type AlertResult = AlertSummary & {
  items: AlertItem[];
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function computeAlerts(deals: Deal[]): AlertResult {
  const now = Date.now();
  const items: AlertItem[] = [];

  let overdue_followups = 0;
  let payment_overdue = 0;
  let deadline_soon = 0;
  let unresolved_checks = 0;

  for (const deal of deals) {
    const nextActionDue = new Date(deal.next_action_due_at).getTime();
    const deadline = deal.deadline ? new Date(deal.deadline).getTime() : null;
    const paymentDue = deal.payment_due_date ? new Date(deal.payment_due_date).getTime() : null;

    if (deal.status === "Replied" && nextActionDue < now) {
      overdue_followups++;
      items.push({
        type: "overdue_followup",
        deal_id: deal.id,
        brand_name: deal.brand_name,
        status: deal.status,
        title: "Follow-up overdue",
        message: `Next action "${deal.next_action}" is overdue.`,
        severity: "high",
        due_at: deal.next_action_due_at,
      });
    }

    if (deal.status === "Confirmed" && deadline !== null && deadline >= now && deadline < now + THREE_DAYS_MS) {
      deadline_soon++;
      items.push({
        type: "deadline_soon",
        deal_id: deal.id,
        brand_name: deal.brand_name,
        status: deal.status,
        title: "Deadline soon",
        message: "Delivery deadline is within 3 days.",
        severity: "medium",
        due_at: deal.deadline ?? null,
      });
    }

    if (deal.status === "Delivered" && paymentDue !== null && paymentDue < now) {
      payment_overdue++;
      items.push({
        type: "payment_overdue",
        deal_id: deal.id,
        brand_name: deal.brand_name,
        status: deal.status,
        title: "Payment overdue",
        message: "Payment due date has passed.",
        severity: "high",
        due_at: deal.payment_due_date ?? null,
      });
    }

    if (deal.unresolved_checks_count > 0) {
      unresolved_checks++;
      items.push({
        type: "unresolved_checks",
        deal_id: deal.id,
        brand_name: deal.brand_name,
        status: deal.status,
        title: "Unresolved checks",
        message: `${deal.unresolved_checks_count} unresolved check(s) remain.`,
        severity: "medium",
        due_at: deal.next_action_due_at ?? null,
      });
    }
  }

  items.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "high" ? -1 : 1;
    if (a.due_at === null && b.due_at === null) return 0;
    if (a.due_at === null) return 1;
    if (b.due_at === null) return -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });

  return { overdue_followups, payment_overdue, deadline_soon, unresolved_checks, items };
}
