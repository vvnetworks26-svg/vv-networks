import { billingProfileRepository } from "../../database/repositories/BillingProfileRepository.js";
import type { IBillingProfile } from "../../database/models/BillingProfile.js";

export async function getBillingProfile(businessId: string): Promise<IBillingProfile | null> {
  return billingProfileRepository.findByBusiness(businessId);
}

export async function upsertBillingProfile(
  businessId: string,
  data: Partial<IBillingProfile>
): Promise<IBillingProfile> {
  return billingProfileRepository.upsertByBusiness(businessId, data);
}
