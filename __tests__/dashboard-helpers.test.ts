import { describe, it, expect } from "vitest";
import {
  filterDealsByTab,
  calcSummary,
  formatKRW,
  formatDate,
  toDatetimeLocal,
  fromDatetimeLocal,
} from "@/lib/dashboard-helpers";
import type { Deal } from "@/types/deal";

// Minimal Deal factory — only fields used by the helpers are populated.
function makeDeal(overrides: Partial<Deal> = {}): Deal {
  const now = new Date().toISOString();
  return {
    id: "d1",
    user_id: "u1",
    brand_name: "TestBrand",
    contact_name: "홍길동",
    contact_channel: "email",
    platform_requested: "instagram",
    deliverables_summary: "릴스 1건",
    budget_mentioned: "협의",
    quote_floor: 300_000,
    quote_target: 500_000,
    quote_premium: 700_000,
    // quote_breakdown_json is typed as QuoteResult but never read by helpers
    quote_breakdown_json: {} as Deal["quote_breakdown_json"],
    deadline: undefined,
    payment_due_date: undefined,
    next_action: "Send reply",
    next_action_due_at: now,
    followup_needed: false,
    unresolved_checks_count: 0,
    status: "Lead",
    notes: undefined,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

// ─── filterDealsByTab ─────────────────────────────────────────────────────────

describe("filterDealsByTab", () => {
  it("returns all deals for the 'all' tab", () => {
    const deals = [makeDeal({ status: "Lead" }), makeDeal({ status: "Paid" })];
    expect(filterDealsByTab(deals, "all")).toHaveLength(2);
  });

  it("includes Lead, Replied, Negotiating, Confirmed in 'active'", () => {
    const deals = [
      makeDeal({ status: "Lead" }),
      makeDeal({ status: "Replied" }),
      makeDeal({ status: "Negotiating" }),
      makeDeal({ status: "Confirmed" }),
      makeDeal({ status: "Delivered" }),
      makeDeal({ status: "Paid" }),
      makeDeal({ status: "ClosedLost" }),
    ];
    const active = filterDealsByTab(deals, "active");
    expect(active).toHaveLength(4);
    expect(active.map((d) => d.status)).toEqual([
      "Lead",
      "Replied",
      "Negotiating",
      "Confirmed",
    ]);
  });

  it("includes Delivered and Paid in 'done'", () => {
    const deals = [
      makeDeal({ status: "Delivered" }),
      makeDeal({ status: "Paid" }),
      makeDeal({ status: "Lead" }),
    ];
    expect(filterDealsByTab(deals, "done")).toHaveLength(2);
  });

  it("includes only ClosedLost in 'lost'", () => {
    const deals = [makeDeal({ status: "ClosedLost" }), makeDeal({ status: "Lead" })];
    expect(filterDealsByTab(deals, "lost")).toHaveLength(1);
    expect(filterDealsByTab(deals, "lost")[0].status).toBe("ClosedLost");
  });

  it("returns empty array for an empty input", () => {
    expect(filterDealsByTab([], "active")).toHaveLength(0);
  });
});

// ─── calcSummary ──────────────────────────────────────────────────────────────

describe("calcSummary", () => {
  it("returns all zeros for an empty deal list", () => {
    expect(calcSummary([])).toEqual({ total: 0, active: 0, dueThisWeek: 0, pipeline: 0 });
  });

  it("counts total deals", () => {
    expect(calcSummary([makeDeal(), makeDeal(), makeDeal()]).total).toBe(3);
  });

  it("counts active deals correctly", () => {
    const deals = [
      makeDeal({ status: "Lead" }),
      makeDeal({ status: "Replied" }),
      makeDeal({ status: "Negotiating" }),
      makeDeal({ status: "Confirmed" }),
      makeDeal({ status: "Paid" }),
      makeDeal({ status: "ClosedLost" }),
    ];
    expect(calcSummary(deals).active).toBe(4);
  });

  it("counts deals with deadline within next 7 days", () => {
    const soon = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const far = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const past = new Date(Date.now() - 1000).toISOString();
    const deals = [
      makeDeal({ deadline: soon }),
      makeDeal({ deadline: far }),
      makeDeal({ deadline: past }),
      makeDeal({ deadline: undefined }),
    ];
    expect(calcSummary(deals).dueThisWeek).toBe(1);
  });

  it("sums quote_target only for Confirmed deals", () => {
    const deals = [
      makeDeal({ status: "Confirmed", quote_target: 500_000 }),
      makeDeal({ status: "Confirmed", quote_target: 300_000 }),
      makeDeal({ status: "Lead", quote_target: 1_000_000 }),
    ];
    expect(calcSummary(deals).pipeline).toBe(800_000);
  });

  it("pipeline is 0 when no Confirmed deals exist", () => {
    expect(calcSummary([makeDeal({ status: "Lead" })]).pipeline).toBe(0);
  });
});

// ─── formatKRW ────────────────────────────────────────────────────────────────

describe("formatKRW", () => {
  it("formats zero", () => {
    expect(formatKRW(0)).toBe("0 ₩");
  });

  it("formats a typical amount", () => {
    const result = formatKRW(500_000);
    expect(result).toContain("₩");
    expect(result).toContain("500");
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("returns em-dash for null input", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em-dash for undefined input", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("returns a non-empty string for a valid ISO date", () => {
    const result = formatDate("2024-06-15T00:00:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toBe("—");
  });
});

// ─── toDatetimeLocal / fromDatetimeLocal ──────────────────────────────────────

describe("toDatetimeLocal", () => {
  it("returns empty string for null", () => {
    expect(toDatetimeLocal(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(toDatetimeLocal(undefined)).toBe("");
  });

  it("slices to 16 chars (YYYY-MM-DDTHH:mm)", () => {
    expect(toDatetimeLocal("2024-01-15T10:30:00.000Z")).toBe("2024-01-15T10:30");
  });
});

describe("fromDatetimeLocal", () => {
  it("returns undefined for empty string", () => {
    expect(fromDatetimeLocal("")).toBeUndefined();
  });

  it("returns an ISO string for a datetime-local value", () => {
    const result = fromDatetimeLocal("2024-01-15T10:30");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
    // Must be a valid date
    expect(isNaN(new Date(result!).getTime())).toBe(false);
  });
});
