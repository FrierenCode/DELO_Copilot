// Pure helper functions for dashboard UI logic.
// No server-only imports — safe for both server and client use.

import type { Deal, DealStatus } from "@/types/deal";

export type DealTab = "all" | "active" | "done" | "lost";

const ACTIVE_STATUSES: DealStatus[] = ["Lead", "Replied", "Negotiating", "Confirmed"];
const DONE_STATUSES: DealStatus[] = ["Delivered", "Paid"];
const LOST_STATUSES: DealStatus[] = ["ClosedLost"];

export function filterDealsByTab(deals: Deal[], tab: DealTab): Deal[] {
  if (tab === "all") return deals;
  if (tab === "active") return deals.filter((d) => ACTIVE_STATUSES.includes(d.status));
  if (tab === "done") return deals.filter((d) => DONE_STATUSES.includes(d.status));
  if (tab === "lost") return deals.filter((d) => LOST_STATUSES.includes(d.status));
  return deals;
}

export type DashboardSummary = {
  total: number;
  active: number;
  dueThisWeek: number;
  pipeline: number;
};

export function calcSummary(deals: Deal[]): DashboardSummary {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;

  const active = deals.filter((d) => ACTIVE_STATUSES.includes(d.status)).length;

  const dueThisWeek = deals.filter((d) => {
    if (!d.deadline) return false;
    const dl = new Date(d.deadline).getTime();
    return dl >= now && dl < now + weekMs;
  }).length;

  const pipeline = deals
    .filter((d) => d.status === "Confirmed")
    .reduce((sum, d) => sum + (d.quote_target ?? 0), 0);

  return { total: deals.length, active, dueThisWeek, pipeline };
}

export function formatKRW(amount: number): string {
  return amount.toLocaleString("ko-KR") + " ₩";
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Convert ISO datetime to datetime-local input value (YYYY-MM-DDTHH:mm). */
export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

/** Convert datetime-local input value back to ISO string, or undefined if empty. */
export function fromDatetimeLocal(value: string): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString();
}
