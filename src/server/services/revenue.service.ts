import mongoose from "mongoose";
import { invoiceRepository } from "../../database/repositories/InvoiceRepository.js";
import { paymentRepository } from "../../database/repositories/PaymentRepository.js";
import { subscriptionRepository } from "../../database/repositories/SubscriptionRepository.js";

export interface RevenueMetrics {
  mrr:                number;
  arr:                number;
  totalRevenue:       number;
  outstandingBalance: number;
  revenueThisMonth:   number;
  revenueThisYear:    number;
  averageInvoiceValue: number;
  invoiceCount:       number;
  customerCount:      number;
  subscriptionCount:  number;
  growth:             number | null;   // month-over-month %, null if no prior data
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
}

export interface RevenueByService {
  service: string;
  revenue: number;
}

export async function getRevenueMetrics(businessId: string): Promise<RevenueMetrics> {
  const bid = new mongoose.Types.ObjectId(businessId);

  const [
    invoiceStats,
    revenueByMonth,
    mrr,
    subCount,
    customerAgg,
  ] = await Promise.all([
    invoiceRepository.getRevenueStats(businessId),
    invoiceRepository.getRevenueByMonth(businessId, 13), // 13 months for growth calc
    subscriptionRepository.getMRR(businessId),
    subscriptionRepository.getCount(businessId),
    invoiceRepository.aggregate<{ count: number }>([
      { $match: { businessId: bid, deletedAt: null } },
      { $group: { _id: "$clientId" } },
      { $count: "count" },
    ]),
  ]);

  const now        = new Date();
  const thisYear   = now.getFullYear();
  const thisMonth  = now.getMonth() + 1;
  const lastMonth  = thisMonth === 1 ? 12 : thisMonth - 1;
  const lastMonthYear = thisMonth === 1 ? thisYear - 1 : thisYear;

  const monthRevenue = (y: number, m: number): number =>
    revenueByMonth.find((r) => r.year === y && r.month === m)?.revenue ?? 0;

  const revenueThisMonth  = monthRevenue(thisYear, thisMonth);
  const revenueLastMonth  = monthRevenue(lastMonthYear, lastMonth);
  const revenueThisYear   = revenueByMonth
    .filter((r) => r.year === thisYear)
    .reduce((s, r) => s + r.revenue, 0);

  const growth =
    revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 10000) / 100
      : null;

  return {
    mrr,
    arr:                Math.round(mrr * 12 * 100) / 100,
    totalRevenue:       invoiceStats.totalPaid,
    outstandingBalance: invoiceStats.totalOutstanding,
    revenueThisMonth,
    revenueThisYear,
    averageInvoiceValue: invoiceStats.averageValue,
    invoiceCount:       invoiceStats.count,
    customerCount:      customerAgg[0]?.count ?? 0,
    subscriptionCount:  subCount.total,
    growth,
  };
}

export async function getMonthlyRevenue(
  businessId: string,
  months = 12
): Promise<MonthlyRevenue[]> {
  return invoiceRepository.getRevenueByMonth(businessId, months);
}

export async function getAnnualRevenue(businessId: string): Promise<number> {
  const now   = new Date();
  const since = new Date(now.getFullYear(), 0, 1); // Jan 1 this year
  const bid   = new mongoose.Types.ObjectId(businessId);

  const result = await invoiceRepository.aggregate<{ total: number }>([
    {
      $match: {
        businessId: bid,
        status:     "paid",
        paidAt:     { $gte: since },
        deletedAt:  null,
      },
    },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  return result[0]?.total ?? 0;
}

export async function getRevenueByService(businessId: string): Promise<RevenueByService[]> {
  return invoiceRepository.getRevenueByService(businessId);
}

export async function getRevenueGrowthHistory(businessId: string, months = 12): Promise<
  Array<{ year: number; month: number; revenue: number; growthPct: number | null }>
> {
  const data = await invoiceRepository.getRevenueByMonth(businessId, months + 1);
  return data.slice(1).map((curr, idx) => {
    const prev = data[idx];
    const growthPct =
      prev && prev.revenue > 0
        ? Math.round(((curr.revenue - prev.revenue) / prev.revenue) * 10000) / 100
        : null;
    return { ...curr, growthPct };
  });
}
