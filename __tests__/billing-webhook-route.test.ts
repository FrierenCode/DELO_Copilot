import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockConstructEvent = vi.fn();
const mockHandleCheckoutCompleted = vi.fn();
const mockHandleSubscriptionUpdated = vi.fn();
const mockHandleSubscriptionDeleted = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }),
  getWebhookSecret: () => "whsec_test",
}));

vi.mock("@/services/billing-service", () => ({
  handleCheckoutCompleted: (...args: unknown[]) => mockHandleCheckoutCompleted(...args),
  handleSubscriptionUpdated: (...args: unknown[]) => mockHandleSubscriptionUpdated(...args),
  handleSubscriptionDeleted: (...args: unknown[]) => mockHandleSubscriptionDeleted(...args),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
}));

// ── Dynamic imports (module level) ───────────────────────────────────────────

const { POST } = await import("@/app/api/billing/webhook/route");

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeWebhookRequest(body: string, sig = "valid-sig") {
  return new Request("http://localhost/api/billing/webhook", {
    method: "POST",
    headers: {
      "stripe-signature": sig,
      "Content-Type": "application/json",
    },
    body,
  });
}

const FAKE_EVENT_BASE = {
  id: "evt_test_123",
  livemode: false,
  created: 0,
  api_version: "2024-06-20",
  object: "event",
  data: { object: {} },
  pending_webhooks: 0,
  request: null,
};

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/billing/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleCheckoutCompleted.mockResolvedValue(undefined);
    mockHandleSubscriptionUpdated.mockResolvedValue(undefined);
    mockHandleSubscriptionDeleted.mockResolvedValue(undefined);
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const req = new Request("http://localhost/api/billing/webhook", {
      method: "POST",
      body: "{}",
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error("Webhook signature verification failed");
    });
    const res = await POST(makeWebhookRequest("{}", "bad-sig") as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid signature");
  });

  it("calls handleCheckoutCompleted on checkout.session.completed", async () => {
    const event = { ...FAKE_EVENT_BASE, type: "checkout.session.completed" };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleCheckoutCompleted).toHaveBeenCalledWith(event);
  });

  it("calls handleSubscriptionUpdated on customer.subscription.updated", async () => {
    const event = { ...FAKE_EVENT_BASE, type: "customer.subscription.updated" };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleSubscriptionUpdated).toHaveBeenCalledWith(event);
  });

  it("calls handleSubscriptionDeleted on customer.subscription.deleted", async () => {
    const event = { ...FAKE_EVENT_BASE, type: "customer.subscription.deleted" };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleSubscriptionDeleted).toHaveBeenCalledWith(event);
  });

  it("returns 200 without calling handlers for unrecognised event types", async () => {
    const event = { ...FAKE_EVENT_BASE, type: "payment_intent.created" };
    mockConstructEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleCheckoutCompleted).not.toHaveBeenCalled();
    expect(mockHandleSubscriptionUpdated).not.toHaveBeenCalled();
  });

  it("returns 500 when handler throws so Stripe retries the event", async () => {
    const event = { ...FAKE_EVENT_BASE, type: "checkout.session.completed" };
    mockConstructEvent.mockReturnValueOnce(event);
    mockHandleCheckoutCompleted.mockRejectedValueOnce(new Error("DB down"));

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(500);
  });
});
