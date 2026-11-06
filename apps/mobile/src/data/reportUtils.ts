import { ReportPeriod, Sale } from "@/data/inventoryApi";

export function salesForPeriod(sales: Sale[], period: ReportPeriod): Sale[] {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === "Weekly") start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  if (period === "Monthly") start.setUTCDate(1);
  if (period === "Annual") { start.setUTCMonth(0); start.setUTCDate(1); }
  const startDate = start.toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  return sales.filter((sale) => sale.date >= startDate && sale.date <= today);
}
