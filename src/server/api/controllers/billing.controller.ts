import type { Request, Response } from "express";
import { ok, serverError, badRequest } from "../response.js";
import { getBid } from "../middleware.js";
import { getBillingProfile, upsertBillingProfile } from "../../services/billing.service.js";
import { getRevenueMetrics, getMonthlyRevenue, getRevenueByService, getRevenueGrowthHistory } from "../../services/revenue.service.js";
import { subscriptionRepository } from "../../../database/repositories/SubscriptionRepository.js";
import { invoiceRepository } from "../../../database/repositories/InvoiceRepository.js";
import { paymentRepository } from "../../../database/repositories/PaymentRepository.js";

export async function getBillingProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const profile = await getBillingProfile(getBid(req));
    ok(res, profile ?? {});
  } catch { serverError(res); }
}

export async function updateBillingProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const profile = await upsertBillingProfile(getBid(req), req.body);
    ok(res, profile);
  } catch { serverError(res); }
}

export async function getRevenueHandler(req: Request, res: Response): Promise<void> {
  try {
    const businessId = getBid(req);
    const { months = 12 } = req.query as any;
    const [metrics, byMonth, byService, growth] = await Promise.all([
      getRevenueMetrics(businessId),
      getMonthlyRevenue(businessId, +months),
      getRevenueByService(businessId),
      getRevenueGrowthHistory(businessId, +months),
    ]);
    ok(res, { metrics, byMonth, byService, growth });
  } catch { serverError(res); }
}

export async function getBillingDashboardHandler(req: Request, res: Response): Promise<void> {
  try {
    const businessId = getBid(req);

    const [
      metrics,
      recentInvoices,
      upcomingRenewals,
      recentPayments,
      outstandingInvoices,
    ] = await Promise.all([
      getRevenueMetrics(businessId),
      invoiceRepository.findRecentPaid(businessId, 5),
      subscriptionRepository.findUpcomingRenewals(businessId, 14),
      paymentRepository.findByBusiness(businessId, { page: 1, limit: 5 }),
      invoiceRepository.findOverdue(businessId),
    ]);

    ok(res, {
      revenue: {
        mrr:                metrics.mrr,
        arr:                metrics.arr,
        totalRevenue:       metrics.totalRevenue,
        outstandingBalance: metrics.outstandingBalance,
        revenueThisMonth:   metrics.revenueThisMonth,
        growth:             metrics.growth,
      },
      counts: {
        subscriptions: metrics.subscriptionCount,
        customers:     metrics.customerCount,
        invoices:      metrics.invoiceCount,
      },
      recentInvoices,
      outstandingInvoices: outstandingInvoices.slice(0, 5),
      upcomingRenewals,
      recentPayments: recentPayments.data,
    });
  } catch { serverError(res); }
}
