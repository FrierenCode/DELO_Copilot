import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────────────────

let mockUser: { id: string; email: string } | null = {
  id: "user-1",
  email: "test@example.com",
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: mockUser } }),
    },
  }),
}));

const mockCreateCheckoutSession = vi.fn(async () => ({
  url: "https://checkout.polar.sh/checkout/cs_test_123",
}));

vi.mock("@/services/billing-service", () => ({
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
}));

vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
}));

// ── Dynamic imports (must be at module level, after vi.mock) ─────────────────

const { POST } = await import("@/app/api/billing/checkout/route");

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: unknown = {}) {
  return new Request("http://localhost/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/billing/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { id: "user-1", email: "test@example.com" };
    mockCreateCheckoutSession.mockResolvedValue({
      url: "https://checkout.polar.sh/checkout/cs_test_123",
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockUser = null;
    const res = await POST(makeRequest() as never);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("creates checkout session and returns URL for authenticated user", async () => {
    mockCreateCheckoutSession.mockResolvedValueOnce({
      url: "https://checkout.polar.sh/checkout/cs_test_123",
    });
    const res = await POST(makeRequest({ cancel_path: "/settings" }) as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.url).toContain("checkout.polar.sh");
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      "user-1",
      "test@example.com",
      "/settings",
      expect.stringContaining("/dashboard?upgraded=true"),
    );
  });

  it("uses default cancel_path /settings when none provided", async () => {
    mockCreateCheckoutSession.mockResolvedValueOnce({ url: "https://checkout.polar.sh/checkout/x" });
    await POST(makeRequest({}) as never);
    expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
      "user-1",
      "test@example.com",
      "/settings",
      expect.any(String),
    );
  });

  it("returns 500 when checkout session creation throws", async () => {
    mockCreateCheckoutSession.mockRejectedValueOnce(new Error("Stripe error"));
    const res = await POST(makeRequest() as never);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
  });
});
