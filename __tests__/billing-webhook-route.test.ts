import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockValidateEvent = vi.fn();
const mockHandleSubscriptionCreated = vi.fn();
const mockHandleSubscriptionUpdated = vi.fn();
const mockHandleSubscriptionRevoked = vi.fn();

vi.mock("@polar-sh/sdk/webhooks", () => ({
  validateEvent: (...args: unknown[]) => mockValidateEvent(...args),
  WebhookVerificationError: class WebhookVerificationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "WebhookVerificationError";
    }
  },
}));

vi.mock("@/lib/polar", () => ({
  getWebhookSecret: () => "whsec_test",
}));

vi.mock("@/services/billing-service", () => ({
  handleSubscriptionCreated: (...args: unknown[]) => mockHandleSubscriptionCreated(...args),
  handleSubscriptionUpdated: (...args: unknown[]) => mockHandleSubscriptionUpdated(...args),
  handleSubscriptionRevoked: (...args: unknown[]) => mockHandleSubscriptionRevoked(...args),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
}));

// ── Dynamic imports (must be at module level, after vi.mock) ─────────────────

const { POST } = await import("@/app/api/billing/webhook/route");

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeWebhookRequest(body: string) {
  return new Request("http://localhost/api/billing/webhook", {
    method: "POST",
    headers: {
      "webhook-id": "wh_test_123",
      "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
      "webhook-signature": "v1,valid-sig",
      "Content-Type": "application/json",
    },
    body,
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/billing/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHandleSubscriptionCreated.mockResolvedValue(undefined);
    mockHandleSubscriptionUpdated.mockResolvedValue(undefined);
    mockHandleSubscriptionRevoked.mockResolvedValue(undefined);
  });

  it("returns 400 when signature verification fails", async () => {
    const { WebhookVerificationError } = await import("@polar-sh/sdk/webhooks");
    mockValidateEvent.mockImplementationOnce(() => {
      throw new WebhookVerificationError("Webhook signature verification failed");
    });
    const res = await POST(makeWebhookRequest("{}") as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid signature");
  });

  it("calls handleSubscriptionCreated on subscription.created", async () => {
    const event = { type: "subscription.created", timestamp: new Date(), data: {} };
    mockValidateEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleSubscriptionCreated).toHaveBeenCalledWith(event);
  });

  it("calls handleSubscriptionUpdated on subscription.updated", async () => {
    const event = { type: "subscription.updated", timestamp: new Date(), data: {} };
    mockValidateEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleSubscriptionUpdated).toHaveBeenCalledWith(event);
  });

  it("calls handleSubscriptionRevoked on subscription.revoked", async () => {
    const event = { type: "subscription.revoked", timestamp: new Date(), data: {} };
    mockValidateEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleSubscriptionRevoked).toHaveBeenCalledWith(event);
  });

  it("returns 200 without calling handlers for unrecognised event types", async () => {
    const event = { type: "order.created", timestamp: new Date(), data: {} };
    mockValidateEvent.mockReturnValueOnce(event);

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(200);
    expect(mockHandleSubscriptionCreated).not.toHaveBeenCalled();
    expect(mockHandleSubscriptionUpdated).not.toHaveBeenCalled();
    expect(mockHandleSubscriptionRevoked).not.toHaveBeenCalled();
  });

  it("returns 500 when handler throws so Polar retries the event", async () => {
    const event = { type: "subscription.created", timestamp: new Date(), data: {} };
    mockValidateEvent.mockReturnValueOnce(event);
    mockHandleSubscriptionCreated.mockRejectedValueOnce(new Error("DB down"));

    const res = await POST(makeWebhookRequest(JSON.stringify(event)) as never);
    expect(res.status).toBe(500);
  });
});
