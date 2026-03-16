import { NextRequest, NextResponse } from "next/server";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { getWebhookSecret } from "@/lib/polar";
import {
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionRevoked,
} from "@/services/billing-service";
import { logInfo, logError } from "@/lib/logger";
import { captureException } from "@/lib/sentry";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  // Convert NextRequest headers to a plain Record<string, string>
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let event;
  try {
    event = validateEvent(rawBody, headers, getWebhookSecret());
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      logError("webhook signature verification failed", { error: err.message });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    logError("webhook validation error", {
      error: err instanceof Error ? err.message : "unknown",
    });
    captureException(err, { route: "billing/webhook", stage: "signature_verification" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logInfo("webhook event received", { type: event.type });

  try {
    switch (event.type) {
      case "subscription.created":
        await handleSubscriptionCreated(event);
        break;
      case "subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "subscription.revoked":
        await handleSubscriptionRevoked(event);
        break;
      default:
        logInfo("webhook event type not handled", { type: event.type });
    }
  } catch (err) {
    logError("webhook handler failed", {
      type: event.type,
      error: err instanceof Error ? err.message : "unknown",
    });
    captureException(err, { route: "billing/webhook", eventType: event.type });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
