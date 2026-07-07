import { businessRepository } from "../../database/repositories/BusinessRepository.js";
import type { IBusiness } from "../../database/models/Business.js";

const BUSINESS_ID = process.env.VV_BUSINESS_ID ?? null;

export async function getBusiness(): Promise<IBusiness | null> {
  if (BUSINESS_ID) return businessRepository.findById(BUSINESS_ID);
  const results = await businessRepository.findActive();
  return results[0] ?? null;
}

export async function updateBusiness(id: string, data: Partial<IBusiness>): Promise<IBusiness | null> {
  return businessRepository.update(id, data);
}
