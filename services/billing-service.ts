import "server-only";
import { getPolar, getProductId } from "@/lib/polar";
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
 * Creates a Polar hosted checkout session for the Pro subscription.
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  _cancelPath: string,
  successUrl: string,
): Promise<CheckoutResult> {
  const polar = getPolar();
  const productId = getProductId();

  const checkout = await polar.checkouts.create({
    products: [productId],
    successUrl,
    customerEmail: userEmail,
    metadata: { supabase_user_id: userId },
  });

  logInfo("checkout created", { userId });
  return { url: checkout.url };
}

type PolarSubscriptionEvent = {
  type: string;
  timestamp: Date;
  data: {
    id: string;
    customerId: string;
    status: string;
    currentPeriodEnd: Date;
    modifiedAt: Date | null;
    metadata: Record<string, unknown>;
  };
};

/**
 * Handles `subscription.created` webhook.
 * The subscription.id is used as the idempotency key.
 */
export async function handleSubscriptionCreated(
  event: PolarSubscriptionEvent,
): Promise<void> {
  const sub = event.data;
  if (await isEventProcessed(sub.id + "_created")) {
    logInfo("webhook already processed (idempotent)", { subId: sub.id });
    return;
  }

  const userId = (sub.metadata as Record<string, unknown> | undefined)?.supabase_user_id as string | undefined;
  if (!userId) {
    logError("subscription.created missing supabase_user_id in metadata", { subId: sub.id });
    return;
  }

  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null;

  await upsertSubscription({
    user_id: userId,
    polar_customer_id: sub.customerId,
    polar_subscription_id: sub.id,
    status: sub.status,
    plan: "pro",
    current_period_end: periodEnd,
    polar_event_id: sub.id + "_created",
  });
  await syncUserPlan(userId, "pro");
  trackEvent(userId, "upgraded_to_pro", { polar_subscription_id: sub.id });
  logInfo("user upgraded to pro via subscription.created", { userId, subId: sub.id });
}

/**
 * Handles `subscription.updated` webhook.
 */
export async function handleSubscriptionUpdated(
  event: PolarSubscriptionEvent,
): Promise<void> {
  const sub = event.data;
  const eventId = sub.id + "_updated_" + (sub.modifiedAt ? new Date(sub.modifiedAt).toISOString() : "");
  if (await isEventProcessed(eventId)) return;

  const isActive = sub.status === "active" || sub.status === "trialing";
  const plan: "free" | "pro" = isActive ? "pro" : "free";
  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null;

  let row = await findSubscriptionByCustomerId(sub.customerId);

  if (!row) {
    const userId = (sub.metadata as Record<string, unknown> | undefined)?.supabase_user_id as string | undefined;
    if (!userId) {
      logError("subscription.updated: customer not found and no metadata", { customerId: sub.customerId });
      return;
    }
    await upsertSubscription({
      user_id: userId,
      polar_customer_id: sub.customerId,
      polar_subscription_id: sub.id,
      status: sub.status,
      plan,
      current_period_end: periodEnd,
      polar_event_id: eventId,
    });
    await syncUserPlan(userId, plan);
    logInfo("subscription updated (from metadata)", { userId, status: sub.status, plan });
    return;
  }

  await upsertSubscription({
    user_id: row.user_id,
    polar_customer_id: row.polar_customer_id,
    polar_subscription_id: sub.id,
    status: sub.status,
    plan,
    current_period_end: periodEnd,
    polar_event_id: eventId,
  });
  await syncUserPlan(row.user_id, plan);
  logInfo("subscription updated", { userId: row.user_id, status: sub.status, plan });
}

/**
 * Handles `subscription.revoked` webhook.
 */
export async function handleSubscriptionRevoked(
  event: PolarSubscriptionEvent,
): Promise<void> {
  const sub = event.data;
  const eventId = sub.id + "_revoked";
  if (await isEventProcessed(eventId)) return;

  const row = await findSubscriptionByCustomerId(sub.customerId);
  if (!row) {
    logError("subscription.revoked: customer not found", { customerId: sub.customerId });
    return;
  }

  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toISOString() : null;

  await upsertSubscription({
    user_id: row.user_id,
    polar_customer_id: row.polar_customer_id,
    polar_subscription_id: sub.id,
    status: "revoked",
    plan: "free",
    current_period_end: periodEnd,
    polar_event_id: eventId,
  });
  await syncUserPlan(row.user_id, "free");
  trackEvent(row.user_id, "plan_cancelled");
  logInfo("subscription revoked, user downgraded to free", { userId: row.user_id });
}
