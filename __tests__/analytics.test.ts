import { describe, it, expect, vi, beforeEach } from "vitest";

const capture = vi.fn();
const flush = vi.fn(() => Promise.resolve());

vi.mock("posthog-node", () => ({
  PostHog: vi.fn(() => ({
    capture,
    flush,
  })),
}));

const { createAnalyticsTracker } = await import("@/lib/analytics");

describe("analytics tracker", () => {
  beforeEach(() => {
    capture.mockClear();
    flush.mockClear();
    delete process.env.POSTHOG_API_KEY;
    process.env.POSTHOG_API_KEY = "test-key";
  });

  it("merges common properties into each event", () => {
    const tracker = createAnalyticsTracker({
      user_id: "user-1",
      plan: "standard",
      request_id: "req-1",
      source_type: "email",
    });

    tracker.track("parse_started");

    expect(capture).toHaveBeenCalledWith(expect.objectContaining({
      distinctId: "user-1",
      event: "parse_started",
      properties: expect.objectContaining({
        user_id: "user-1",
        plan: "standard",
        request_id: "req-1",
        source_type: "email",
      }),
    }));
  });

  it("dedupes repeated emissions within the same tracker", () => {
    const tracker = createAnalyticsTracker({
      user_id: "user-1",
      request_id: "req-1",
    });

    tracker.track("quote_viewed");
    tracker.track("quote_viewed");

    expect(capture).toHaveBeenCalledTimes(1);
  });
});
