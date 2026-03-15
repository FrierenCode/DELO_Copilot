import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockUpsertSubscription = vi.fn();
const mockFindByCustomerId = vi.fn();
const mockFindByUserId = vi.fn();
const mockIsEventProcessed = vi.fn();
const mockSyncUserPlan = vi.fn();

vi.mock("@/repositories/subscriptions-repo", () => ({
  upsertSubscription: (...args: unknown[]) => mockUpsertSubscription(...args),
  findSubscriptionByCustomerId: (...args: unknown[]) => mockFindByCustomerId(...args),
  findSubscriptionByUserId: (...args: unknown[]) => mockFindByUserId(...args),
  isEventProcessed: (...args: unknown[]) => mockIsEventProcessed(...args),
  syncUserPlan: (...args: unknown[]) => mockSyncUserPlan(...args),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    subscriptions: {
      retrieve: vi.fn(async () => ({ current_period_end: 9999999999 })),
    },
    customers: {
      create: vi.fn(async () => ({ id: "cus_new" })),
    },
    checkout: {
      sessions: {
        create: vi.fn(async () => ({
          id: "cs_123",
          url: "https://checkout.stripe.com/pay/cs_123",
        })),
      },
    },
  }),
  getPriceId: () => "price_pro",
}));

const mockTrackEvent = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => mockTrackEvent(...args),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
}));

// ── Dynamic imports (module level) ───────────────────────────────────────────

const {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} = await import("@/services/billing-service");

// ── Helpers ──────────────────────────────────────────────────────────────────

const CUSTOMER_ID = "cus_123";
const USER_ID = "user-1";
const SUB_ID = "sub_123";

function makeCheckoutEvent(userId = USER_ID, customerId = CUSTOMER_ID, subId: string | null = SUB_ID) {
  return {
    id: "evt_checkout_001",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_123",
        customer: customerId,
        subscription: subId,
        metadata: { supabase_user_id: userId },
      },
    },
  } as never;
}

function makeSubEvent(
  type: string,
  customerId = CUSTOMER_ID,
  subId = SUB_ID,
  status = "active",
  periodEnd = 9999999999,
) {
  return {
    id: `evt_sub_${type}_${Date.now()}`,
    type,
    data: {
      object: {
        id: subId,
        customer: customerId,
        status,
        current_period_end: periodEnd,
      },
    },
  } as never;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("billing-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsEventProcessed.mockResolvedValue(false);
    mockUpsertSubscription.mockResolvedValue({});
    mockSyncUserPlan.mockResolvedValue(undefined);
    mockFindByCustomerId.mockResolvedValue({
      user_id: USER_ID,
      stripe_customer_id: CUSTOMER_ID,
    });
    mockFindByUserId.mockResolvedValue(null);
  });

  // ── handleCheckoutCompleted ────────────────────────────────────────────────

  describe("handleCheckoutCompleted", () => {
    it("upgrades user to pro and fires upgraded_to_pro event", async () => {
      await handleCheckoutCompleted(makeCheckoutEvent());
      expect(mockUpsertSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "pro", status: "active", user_id: USER_ID }),
      );
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "pro");
      expect(mockTrackEvent).toHaveBeenCalledWith(
        USER_ID,
        "upgraded_to_pro",
        expect.anything(),
      );
    });

    it("is idempotent — skips when event already processed", async () => {
      mockIsEventProcessed.mockResolvedValueOnce(true);
      await handleCheckoutCompleted(makeCheckoutEvent());
      expect(mockUpsertSubscription).not.toHaveBeenCalled();
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });

    it("skips when supabase_user_id metadata is missing", async () => {
      const event = {
        id: "evt_no_meta",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_123",
            customer: CUSTOMER_ID,
            subscription: SUB_ID,
            metadata: {},
          },
        },
      } as never;
      await handleCheckoutCompleted(event);
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });
  });

  // ── handleSubscriptionUpdated ──────────────────────────────────────────────

  describe("handleSubscriptionUpdated", () => {
    it("keeps plan as pro when subscription is active", async () => {
      await handleSubscriptionUpdated(makeSubEvent("customer.subscription.updated"));
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "pro");
    });

    it("downgrades to free when subscription is past_due", async () => {
      await handleSubscriptionUpdated(
        makeSubEvent("customer.subscription.updated", CUSTOMER_ID, SUB_ID, "past_due"),
      );
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "free");
    });

    it("is idempotent", async () => {
      mockIsEventProcessed.mockResolvedValueOnce(true);
      await handleSubscriptionUpdated(makeSubEvent("customer.subscription.updated"));
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });
  });

  // ── handleSubscriptionDeleted ──────────────────────────────────────────────

  describe("handleSubscriptionDeleted", () => {
    it("downgrades to free and fires plan_cancelled event", async () => {
      await handleSubscriptionDeleted(makeSubEvent("customer.subscription.deleted"));
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "free");
      expect(mockTrackEvent).toHaveBeenCalledWith(USER_ID, "plan_cancelled");
    });

    it("is idempotent", async () => {
      mockIsEventProcessed.mockResolvedValueOnce(true);
      await handleSubscriptionDeleted(makeSubEvent("customer.subscription.deleted"));
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });
  });
});
