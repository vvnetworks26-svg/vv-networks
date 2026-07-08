import { couponRepository } from "../../database/repositories/CouponRepository.js";
import type { ICoupon } from "../../database/models/Coupon.js";

export interface CouponValidation {
  valid: boolean;
  reason?: string;
  coupon?: ICoupon;
  discountAmount: number;
}

export async function createCoupon(businessId: string, data: Partial<ICoupon>): Promise<ICoupon> {
  // Ensure unique code within business
  const existing = await couponRepository.findByCode(businessId, (data.code ?? "").toUpperCase());
  if (existing) throw Object.assign(new Error("Coupon code already exists"), { code: "COUPON_EXISTS", status: 409 });
  return couponRepository.create({ ...data, businessId } as unknown as Partial<ICoupon>);
}

export async function listCoupons(businessId: string, page = 1, limit = 20): Promise<ReturnType<typeof couponRepository.findByBusiness>> {
  return couponRepository.findByBusiness(businessId, { page, limit });
}

export async function getCoupon(id: string): Promise<ICoupon | null> {
  return couponRepository.findById(id);
}

export async function updateCoupon(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
  return couponRepository.update(id, data);
}

export async function deleteCoupon(id: string): Promise<ICoupon | null> {
  return couponRepository.softDelete(id);
}

/**
 * Validates a coupon code for use and returns the discount amount
 * for a given subtotal.
 */
export async function validateCoupon(
  businessId: string,
  code: string,
  subtotal: number
): Promise<CouponValidation> {
  const coupon = await couponRepository.findByCode(businessId, code);

  if (!coupon) return { valid: false, reason: "Coupon not found", discountAmount: 0 };
  if (!coupon.isActive) return { valid: false, reason: "Coupon is inactive", discountAmount: 0 };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, reason: "Coupon has expired", discountAmount: 0 };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: "Coupon usage limit reached", discountAmount: 0 };
  }

  const discountAmount =
    coupon.type === "percentage"
      ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
      : Math.min(coupon.value, subtotal);

  return { valid: true, coupon, discountAmount };
}

/** Call after a coupon is successfully used in a transaction. */
export async function redeemCoupon(id: string): Promise<void> {
  await couponRepository.incrementUsage(id);
}
