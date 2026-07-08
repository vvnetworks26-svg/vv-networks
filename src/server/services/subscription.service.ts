import { subscriptionRepository } from "../../database/repositories/SubscriptionRepository.js";
import type { ISubscription, SubscriptionInterval } from "../../database/models/Subscription.js";

export interface CreateSubscriptionInput {
  clientId?: string;
  serviceId?: string;
  name: string;
  interval: SubscriptionInterval;
  amount: number;
  currency?: string;
  trialDays?: number;
  couponId?: string;
  discountAmount?: number;
  metadata?: Record<string, unknown>;
}

function computePeriodEnd(start: Date, interval: SubscriptionInterval): Date {
  const end = new Date(start);
  if (interval === "monthly")   end.setMonth(end.getMonth() + 1);
  if (interval === "quarterly") end.setMonth(end.getMonth() + 3);
  if (interval === "annual")    end.setFullYear(end.getFullYear() + 1);
  return end;
}

export async function createSubscription(
  businessId: string,
  input: CreateSubscriptionInput
): Promise<ISubscription> {
  const now   = new Date();
  const start = new Date(now);

  let status: ISubscription["status"] = "active";
  let trialEndsAt: Date | undefined;

  if (input.trialDays && input.trialDays > 0) {
    status      = "trialing";
    trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + input.trialDays);
  }

  const end = computePeriodEnd(start, input.interval);

  return subscriptionRepository.create({
    businessId,
    clientId:           input.clientId,
    serviceId:          input.serviceId,
    name:               input.name,
    status,
    interval:           input.interval,
    amount:             input.amount,
    currency:           input.currency ?? "USD",
    trialEndsAt,
    currentPeriodStart: start,
    currentPeriodEnd:   end,
    cancelAtPeriodEnd:  false,
    discountAmount:     input.discountAmount ?? 0,
    couponId:           input.couponId,
    metadata:           input.metadata,
  } as unknown as Partial<ISubscription>);
}

export async function listSubscriptions(
  businessId: string,
  page = 1,
  limit = 20
): Promise<ReturnType<typeof subscriptionRepository.findByBusiness>> {
  return subscriptionRepository.findByBusiness(businessId, { page, limit });
}

export async function getSubscription(id: string): Promise<ISubscription | null> {
  return subscriptionRepository.findById(id);
}

export async function updateSubscription(
  id: string,
  data: Partial<ISubscription>
): Promise<ISubscription | null> {
  return subscriptionRepository.update(id, data);
}

/**
 * Cancels a subscription.
 * If atPeriodEnd is true, marks for cancellation at period end.
 * Otherwise cancels immediately.
 */
export async function cancelSubscription(
  id: string,
  atPeriodEnd = true
): Promise<ISubscription | null> {
  const sub = await subscriptionRepository.findById(id);
  if (!sub) return null;

  if (atPeriodEnd) {
    return subscriptionRepository.update(id, { cancelAtPeriodEnd: true });
  }

  return subscriptionRepository.update(id, {
    status:      "cancelled",
    cancelledAt: new Date(),
  });
}

export async function pauseSubscription(id: string): Promise<ISubscription | null> {
  return subscriptionRepository.update(id, { status: "paused" });
}

export async function resumeSubscription(id: string): Promise<ISubscription | null> {
  return subscriptionRepository.update(id, { status: "active", cancelAtPeriodEnd: false });
}

export async function getMRR(businessId: string): Promise<number> {
  return subscriptionRepository.getMRR(businessId);
}

export async function getSubscriptionCount(businessId: string): Promise<ReturnType<typeof subscriptionRepository.getCount>> {
  return subscriptionRepository.getCount(businessId);
}

export async function getUpcomingRenewals(businessId: string): Promise<ISubscription[]> {
  return subscriptionRepository.findUpcomingRenewals(businessId);
}
