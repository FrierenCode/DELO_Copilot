import { NextRequest, NextResponse } from "next/server";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import {
  handleCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
} from "@/services/billing-service";
import { logInfo, logError } from "@/lib/logger";
import { captureException } from "@/lib/sentry";

export const dynamic = "force-dynamic";

// Stripe sends raw body — disable body parsing.
export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  let event;
  try {
    const stripe = getStripe();
    const webhookSecret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    logError("webhook signature verification failed", {
      error: err instanceof Error ? err.message : "unknown",
    });
    captureException(err, { route: "billing/webhook", stage: "signature_verification" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  logInfo("webhook event received", { type: event.type, id: event.id });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      default:
        // Unhandled event types are acknowledged without processing.
        logInfo("webhook event type not handled", { type: event.type });
    }
  } catch (err) {
    logError("webhook handler failed", {
      type: event.type,
      id: event.id,
      error: err instanceof Error ? err.message : "unknown",
    });
    captureException(err, { route: "billing/webhook", eventType: event.type, eventId: event.id });
    // Return 500 so Stripe retries the event.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
