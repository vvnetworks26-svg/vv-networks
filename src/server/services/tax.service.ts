import { taxRateRepository } from "../../database/repositories/TaxRateRepository.js";
import type { ITaxRate } from "../../database/models/TaxRate.js";

export async function listTaxRates(businessId: string, page = 1, limit = 20): Promise<ReturnType<typeof taxRateRepository.findByBusiness>> {
  return taxRateRepository.findByBusiness(businessId, { page, limit });
}

export async function getActiveTaxRates(businessId: string): Promise<ITaxRate[]> {
  return taxRateRepository.findActive(businessId);
}

export async function getTaxRate(id: string): Promise<ITaxRate | null> {
  return taxRateRepository.findById(id);
}

export async function createTaxRate(businessId: string, data: Partial<ITaxRate>): Promise<ITaxRate> {
  const taxRate = await taxRateRepository.create({ ...data, businessId } as unknown as Partial<ITaxRate>);
  if (data.isDefault) {
    await taxRateRepository.setDefault(businessId, String(taxRate._id));
  }
  return taxRate;
}

export async function updateTaxRate(id: string, data: Partial<ITaxRate>): Promise<ITaxRate | null> {
  const taxRate = await taxRateRepository.update(id, data);
  if (taxRate && data.isDefault) {
    await taxRateRepository.setDefault(String(taxRate.businessId), id);
  }
  return taxRate;
}

export async function deleteTaxRate(id: string): Promise<ITaxRate | null> {
  return taxRateRepository.softDelete(id);
}

export async function getDefaultTaxRate(businessId: string): Promise<ITaxRate | null> {
  return taxRateRepository.findDefault(businessId);
}

/** Calculates tax amount for a given subtotal */
export function calculateTax(subtotal: number, ratePercent: number): number {
  return Math.round(subtotal * (ratePercent / 100) * 100) / 100;
}
