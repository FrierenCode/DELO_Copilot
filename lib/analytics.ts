import "server-only";
import { PostHog } from "posthog-node";
import type { AnalyticsCommonProperties, AnalyticsEventName } from "@/lib/analytics-contract";

export type AnalyticsProperties = Partial<AnalyticsCommonProperties> & {
  provider?: string;
  model?: string;
  latency_ms?: number;
  parse_failure_reason?: string;
  missing_fields_count?: number;
  checks_count?: number;
  plan?: string;
  source_type?: string;
  fallback_used?: boolean;
  strategy?: string;
  cache_hit?: boolean;
  daily_count?: number;
  limit?: number;
  endpoint?: string;
  deal_id?: string;
  deal_count?: number;
  status?: string;
  from_status?: string;
  to_status?: string;
  action?: string;
  reason?: string;
  followers_band?: string;
  niche?: string;
  primary_platform?: string;
  geo_region?: string;
  currency?: string;
  cache_layer?: "inquiries" | "parse_cache";
  dedupe_key?: string;
  [key: string]: unknown;
};

export type AnalyticsTrackerContext = AnalyticsCommonProperties;

let clientInstance: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;

  if (!clientInstance) {
    clientInstance = new PostHog(key, {
      host: "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return clientInstance;
}

function normalizeProperties(
  properties?: AnalyticsProperties,
): AnalyticsProperties | undefined {
  if (!properties) return undefined;

  const entries = Object.entries(properties).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries);
}

export function trackEvent(
  userId: string,
  event: AnalyticsEventName | string,
  properties?: AnalyticsProperties,
): void {
  const client = getClient();
  if (!client) return;

  client.capture({
    distinctId: userId,
    event,
    properties: normalizeProperties(properties),
  });
  client.flush().catch(() => {});
}

export function getRequestId(req: Request): string {
  return req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
}

export function createAnalyticsTracker(context: AnalyticsTrackerContext) {
  const emitted = new Set<string>();

  return {
    track(
      event: AnalyticsEventName,
      properties?: Omit<AnalyticsProperties, keyof AnalyticsCommonProperties>,
      options?: { dedupeKey?: string },
    ): void {
      const dedupeKey = options?.dedupeKey ?? properties?.dedupe_key ?? event;
      if (emitted.has(dedupeKey)) return;
      emitted.add(dedupeKey);

      trackEvent(context.user_id, event, {
        ...context,
        ...properties,
      });
    },
  };
}
