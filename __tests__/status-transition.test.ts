import { describe, it, expect } from "vitest";
import { validateStatusTransition } from "@/services/status-transition";

describe("status-transition", () => {
  it("allows valid transitions", () => {
    expect(() => validateStatusTransition("Lead", "Replied")).not.toThrow();
    expect(() => validateStatusTransition("Negotiating", "Confirmed")).not.toThrow();
    expect(() => validateStatusTransition("Delivered", "Paid")).not.toThrow();
  });

  it("rejects invalid transitions", () => {
    expect(() => validateStatusTransition("Lead", "Paid")).toThrow("INVALID_STATUS_TRANSITION");
    expect(() => validateStatusTransition("Paid", "Lead")).toThrow("INVALID_STATUS_TRANSITION");
  });
});
