"use client";

/**
 * Thin client-side analytics helper.
 * Sends events to /api/analytics/event which forwards to PostHog server-side.
 * Fire-and-forget — never throws.
 */

export type ClientAnalyticsProperties = Record<string, unknown>;

export function trackClientEvent(
  event: string,
  properties?: ClientAnalyticsProperties,
): void {
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, properties: properties ?? {} }),
  }).catch(() => {});
}
