import "server-only";
import type Stripe from "stripe";
import { getStripe, getPriceId } from "@/lib/stripe";
import {
  upsertSubscription,
  findSubscriptionByCustomerId,
  isEventProcessed,
  syncUserPlan,
} from "@/repositories/subscriptions-repo";
import { logInfo, logError } from "@/lib/logger";
import { trackEvent } from "@/lib/analytics";

export type CheckoutResult = { url: string };

/**
 * Creates (or retrieves) a Stripe customer for the user and initiates a
 * hosted checkout session for the Pro subscription.
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  cancelPath: string,
  successUrl: string,
): Promise<CheckoutResult> {
  const stripe = getStripe();
  const priceId = getPriceId();

  // Re-use existing customer if one was previously created.
  const existing = await findSubscriptionByCustomerIdOrUserId(userId);
  let customerId = existing?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { supabase_user_id: userId },
    });
    customerId = customer.id;
    // Pre-register the customer row so webhook can look it up.
    await upsertSubscription({
      user_id: userId,
      stripe_customer_id: customerId,
      status: "inactive",
      plan: "free",
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${cancelPath}`,
    allow_promotion_codes: true,
    metadata: { supabase_user_id: userId },
  });

  if (!session.url) throw new Error("Stripe did not return a session URL");
  logInfo("checkout session created", { userId, sessionId: session.id });
  return { url: session.url };
}

/**
 * Handles `checkout.session.completed` webhook.
 * Idempotent — safe to call multiple times for the same Stripe event.
 */
export async function handleCheckoutCompleted(
  event: Stripe.Event,
): Promise<void> {
  if (await isEventProcessed(event.id)) {
    logInfo("webhook already processed (idempotent)", { eventId: event.id });
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.supabase_user_id;
  if (!userId) {
    logError("checkout.session.completed missing supabase_user_id", {
      sessionId: session.id,
    });
    return;
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? "";
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  let periodEnd: string | null = null;
  if (subId) {
    try {
      const stripe = getStripe();
      const sub = await stripe.subscriptions.retrieve(subId);
      periodEnd = new Date(sub.current_period_end * 1000).toISOString();
    } catch {
      // Non-critical — we still upgrade the plan
    }
  }

  await upsertSubscription({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_sub_id: subId,
    status: "active",
    plan: "pro",
    current_period_end: periodEnd,
    stripe_event_id: event.id,
  });
  await syncUserPlan(userId, "pro");
  trackEvent(userId, "upgraded_to_pro", { stripe_sub_id: subId ?? undefined });
  logInfo("user upgraded to pro", { userId, subId });
}

/**
 * Handles `customer.subscription.updated` webhook.
 */
export async function handleSubscriptionUpdated(
  event: Stripe.Event,
): Promise<void> {
  if (await isEventProcessed(event.id)) return;

  const sub = event.data.object as Stripe.Subscription;
  const row = await findSubscriptionByCustomerId(
    typeof sub.customer === "string" ? sub.customer : sub.customer.id,
  );
  if (!row) {
    logError("subscription.updated: customer not found", { customerId: sub.customer });
    return;
  }

  const isActive = sub.status === "active" || sub.status === "trialing";
  const plan: "free" | "pro" = isActive ? "pro" : "free";

  await upsertSubscription({
    user_id: row.user_id,
    stripe_customer_id: row.stripe_customer_id,
    stripe_sub_id: sub.id,
    status: sub.status,
    plan,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    stripe_event_id: event.id,
  });
  await syncUserPlan(row.user_id, plan);
  logInfo("subscription updated", { userId: row.user_id, status: sub.status, plan });
}

/**
 * Handles `customer.subscription.deleted` webhook.
 */
export async function handleSubscriptionDeleted(
  event: Stripe.Event,
): Promise<void> {
  if (await isEventProcessed(event.id)) return;

  const sub = event.data.object as Stripe.Subscription;
  const row = await findSubscriptionByCustomerId(
    typeof sub.customer === "string" ? sub.customer : sub.customer.id,
  );
  if (!row) {
    logError("subscription.deleted: customer not found", { customerId: sub.customer });
    return;
  }

  await upsertSubscription({
    user_id: row.user_id,
    stripe_customer_id: row.stripe_customer_id,
    stripe_sub_id: sub.id,
    status: "canceled",
    plan: "free",
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    stripe_event_id: event.id,
  });
  await syncUserPlan(row.user_id, "free");
  trackEvent(row.user_id, "plan_cancelled");
  logInfo("subscription deleted, user downgraded to free", { userId: row.user_id });
}

// Internal: find by userId (uses repo)
async function findSubscriptionByCustomerIdOrUserId(userId: string) {
  const { findSubscriptionByUserId } = await import("@/repositories/subscriptions-repo");
  return findSubscriptionByUserId(userId);
}
