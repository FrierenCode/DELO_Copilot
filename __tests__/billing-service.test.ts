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

vi.mock("@/lib/polar", () => ({
  getPolar: () => ({
    checkouts: {
      create: vi.fn(async () => ({
        url: "https://checkout.polar.sh/checkout/cs_123",
      })),
    },
  }),
  getProductId: () => "prod_pro",
  getWebhookSecret: () => "whsec_test",
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
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionRevoked,
} = await import("@/services/billing-service");

// ── Helpers ──────────────────────────────────────────────────────────────────

const CUSTOMER_ID = "cus_polar_123";
const USER_ID = "user-1";
const SUB_ID = "sub_polar_123";
const MODIFIED_AT = new Date("2024-01-01T00:00:00.000Z");
const PERIOD_END = new Date("2025-01-01T00:00:00.000Z");

function makeSubscriptionData(overrides: Record<string, unknown> = {}) {
  return {
    id: SUB_ID,
    customerId: CUSTOMER_ID,
    status: "active",
    currentPeriodEnd: PERIOD_END,
    modifiedAt: MODIFIED_AT,
    metadata: { supabase_user_id: USER_ID },
    ...overrides,
  };
}

function makeCreatedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "subscription.created" as const,
    timestamp: new Date(),
    data: makeSubscriptionData(overrides),
  };
}

function makeUpdatedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "subscription.updated" as const,
    timestamp: new Date(),
    data: makeSubscriptionData(overrides),
  };
}

function makeRevokedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "subscription.revoked" as const,
    timestamp: new Date(),
    data: makeSubscriptionData(overrides),
  };
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
      polar_customer_id: CUSTOMER_ID,
    });
    mockFindByUserId.mockResolvedValue(null);
  });

  // ── handleSubscriptionCreated ──────────────────────────────────────────────

  describe("handleSubscriptionCreated", () => {
    it("upgrades user to standard and fires upgraded_to_pro event", async () => {
      await handleSubscriptionCreated(makeCreatedEvent() as never);
      expect(mockUpsertSubscription).toHaveBeenCalledWith(
        expect.objectContaining({ plan: "standard", status: "active", user_id: USER_ID }),
      );
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "standard");
      expect(mockTrackEvent).toHaveBeenCalledWith(
        USER_ID,
        "upgraded_to_pro",
        expect.anything(),
      );
    });

    it("is idempotent — skips when event already processed", async () => {
      mockIsEventProcessed.mockResolvedValueOnce(true);
      await handleSubscriptionCreated(makeCreatedEvent() as never);
      expect(mockUpsertSubscription).not.toHaveBeenCalled();
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });

    it("skips when supabase_user_id metadata is missing", async () => {
      await handleSubscriptionCreated(makeCreatedEvent({ metadata: {} }) as never);
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });
  });

  // ── handleSubscriptionUpdated ──────────────────────────────────────────────

  describe("handleSubscriptionUpdated", () => {
    it("keeps plan as standard when subscription is active", async () => {
      await handleSubscriptionUpdated(makeUpdatedEvent() as never);
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "standard");
    });

    it("downgrades to free when subscription is past_due", async () => {
      await handleSubscriptionUpdated(
        makeUpdatedEvent({ status: "past_due" }) as never,
      );
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "free");
    });

    it("is idempotent", async () => {
      mockIsEventProcessed.mockResolvedValueOnce(true);
      await handleSubscriptionUpdated(makeUpdatedEvent() as never);
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });
  });

  // ── handleSubscriptionRevoked ──────────────────────────────────────────────

  describe("handleSubscriptionRevoked", () => {
    it("downgrades to free and fires plan_cancelled event", async () => {
      await handleSubscriptionRevoked(makeRevokedEvent() as never);
      expect(mockSyncUserPlan).toHaveBeenCalledWith(USER_ID, "free");
      expect(mockTrackEvent).toHaveBeenCalledWith(USER_ID, "plan_cancelled");
    });

    it("is idempotent", async () => {
      mockIsEventProcessed.mockResolvedValueOnce(true);
      await handleSubscriptionRevoked(makeRevokedEvent() as never);
      expect(mockSyncUserPlan).not.toHaveBeenCalled();
    });
  });
});
