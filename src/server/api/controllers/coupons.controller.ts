import type { Request, Response } from "express";
import { ok, created, notFound, serverError, paginated } from "../response.js";
import { getBid } from "../middleware.js";
import {
  createCoupon, listCoupons, getCoupon,
  updateCoupon, deleteCoupon, validateCoupon,
} from "../../services/coupon.service.js";

export async function listCouponsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as any;
    const result = await listCoupons(getBid(req), +page, +limit);
    paginated(res, result.data, {
      page: result.page, limit: +limit,
      total: result.total, totalPages: result.totalPages,
      hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch { serverError(res); }
}

export async function getCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const coupon = await getCoupon(req.params.id);
    if (!coupon) { notFound(res, "Coupon"); return; }
    ok(res, coupon);
  } catch { serverError(res); }
}

export async function createCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const coupon = await createCoupon(getBid(req), req.body);
    created(res, coupon);
  } catch (err: any) {
    const status = err.status ?? 500;
    res.status(status).json({ success: false, error: err.message, code: err.code });
  }
}

export async function updateCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const coupon = await updateCoupon(req.params.id, req.body);
    if (!coupon) { notFound(res, "Coupon"); return; }
    ok(res, coupon);
  } catch { serverError(res); }
}

export async function deleteCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const coupon = await deleteCoupon(req.params.id);
    if (!coupon) { notFound(res, "Coupon"); return; }
    ok(res, { deleted: true });
  } catch { serverError(res); }
}

export async function validateCouponHandler(req: Request, res: Response): Promise<void> {
  try {
    const { code, subtotal } = req.body as { code: string; subtotal: number };
    if (!code || typeof subtotal !== "number") {
      res.status(400).json({ success: false, error: "code and subtotal are required" });
      return;
    }
    const result = await validateCoupon(getBid(req), code, subtotal);
    ok(res, result);
  } catch { serverError(res); }
}
