import "server-only";
import { PostHog } from "posthog-node";

export type AnalyticsProperties = {
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
  // deal events
  deal_id?: string;
  deal_count?: number;
  status?: string;
  from_status?: string;
  to_status?: string;
  action?: string;
  reason?: string;
  // profile events
  followers_band?: string;
  niche?: string;
  [key: string]: unknown;
};

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: "https://app.posthog.com",
      // flushAt: 1 ensures immediate dispatch in serverless environments
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

export function trackEvent(
  userId: string,
  event: string,
  properties?: AnalyticsProperties,
): void {
  const client = getClient();
  if (!client) return;
  client.capture({ distinctId: userId, event, properties });
  // Fire-and-forget flush — non-blocking
  client.flush().catch(() => {});
}
