import { describe, it, expect } from "vitest";
import { computeAlerts } from "@/services/alert-engine";
import type { Deal } from "@/types/deal";

function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "deal-1",
    user_id: "user-1",
    brand_name: "Acme",
    contact_name: "Jane",
    contact_channel: "email",
    platform_requested: "instagram",
    deliverables_summary: "1 reel",
    budget_mentioned: "500000",
    quote_floor: 300000,
    quote_target: 500000,
    quote_premium: 750000,
    quote_breakdown_json: {
      base_fee: 500000,
      usage_rights_fee: 0,
      exclusivity_fee: 0,
      rush_fee: 0,
      floor: 300000,
      target: 500000,
      premium: 750000,
      explanation: "test",
    },
    next_action: "Follow up",
    next_action_due_at: new Date(Date.now() - 86_400_000).toISOString(),
    followup_needed: true,
    unresolved_checks_count: 0,
    status: "Replied",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("alert-engine", () => {
  it("returns structured alert items as well as summary counts", () => {
    const result = computeAlerts([
      makeDeal(),
      makeDeal({
        id: "deal-2",
        status: "Confirmed",
        deadline: new Date(Date.now() + 86_400_000).toISOString(),
      }),
      makeDeal({
        id: "deal-3",
        status: "Delivered",
        payment_due_date: new Date(Date.now() - 86_400_000).toISOString(),
      }),
      makeDeal({
        id: "deal-4",
        status: "Lead",
        unresolved_checks_count: 2,
      }),
    ]);

    expect(result.overdue_followups).toBe(1);
    expect(result.deadline_soon).toBe(1);
    expect(result.payment_overdue).toBe(1);
    expect(result.unresolved_checks).toBe(1);
    expect(result.items).toHaveLength(4);
    expect(result.items[0]).toHaveProperty("deal_id");
    expect(result.items[0]).toHaveProperty("title");
  });
});
