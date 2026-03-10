import type { Deal } from "@/types/deal";

export type AlertSummary = {
  overdue_followups: number;
  payment_overdue: number;
  deadline_soon: number;
  unresolved_checks: number;
};

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function computeAlerts(deals: Deal[]): AlertSummary {
  const now = Date.now();

  let overdue_followups = 0;
  let payment_overdue = 0;
  let deadline_soon = 0;
  let unresolved_checks = 0;

  for (const deal of deals) {
    // Overdue followup: status=Replied and next_action_due_at has passed
    if (
      deal.status === "Replied" &&
      new Date(deal.next_action_due_at).getTime() < now
    ) {
      overdue_followups++;
    }

    // Deadline soon: status=Confirmed and deadline within 3 days
    if (
      deal.status === "Confirmed" &&
      deal.deadline &&
      new Date(deal.deadline).getTime() < now + THREE_DAYS_MS
    ) {
      deadline_soon++;
    }

    // Payment overdue: status=Delivered and payment_due_date has passed
    if (
      deal.status === "Delivered" &&
      deal.payment_due_date &&
      new Date(deal.payment_due_date).getTime() < now
    ) {
      payment_overdue++;
    }

    // Unresolved checks
    if (deal.unresolved_checks_count > 0) {
      unresolved_checks++;
    }
  }

  return { overdue_followups, payment_overdue, deadline_soon, unresolved_checks };
}
