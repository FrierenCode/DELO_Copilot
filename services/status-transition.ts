import "server-only";

import type { DealStatus } from "@/types/deal";

const ALLOWED_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  Lead:        ["Replied", "ClosedLost"],
  Replied:     ["Negotiating", "ClosedLost"],
  Negotiating: ["Confirmed", "ClosedLost"],
  Confirmed:   ["Delivered", "ClosedLost"],
  Delivered:   ["Paid", "ClosedLost"],
  Paid:        ["ClosedLost"],
  ClosedLost:  [],
};

/**
 * Validates that a deal status transition is permitted.
 * Throws Error("INVALID_STATUS_TRANSITION") if not allowed.
 */
export function validateStatusTransition(from: DealStatus, to: DealStatus): void {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }
}
