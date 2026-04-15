import type { Expense } from "./types";

export type CategoryTotal = { category: string; total: number; count: number };

export type ExpenseSummary = {
  totalSpend: number;
  count: number;
  categoryTotals: CategoryTotal[];
  byMonth: { month: string; total: number }[];
  averagePerTransaction: number;
  largestExpense: Expense | null;
  dateRange: { min: string | null; max: string | null };
};

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function buildSummary(expenses: Expense[]): ExpenseSummary {
  if (expenses.length === 0) {
    return {
      totalSpend: 0,
      count: 0,
      categoryTotals: [],
      byMonth: [],
      averagePerTransaction: 0,
      largestExpense: null,
      dateRange: { min: null, max: null },
    };
  }

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const catMap = new Map<string, { total: number; count: number }>();
  for (const e of expenses) {
    const cur = catMap.get(e.category) ?? { total: 0, count: 0 };
    cur.total += e.amount;
    cur.count += 1;
    catMap.set(e.category, cur);
  }
  const categoryTotals: CategoryTotal[] = [...catMap.entries()]
    .map(([category, v]) => ({
      category,
      total: v.total,
      count: v.count,
    }))
    .sort((a, b) => b.total - a.total);

  const monthMap = new Map<string, number>();
  for (const e of expenses) {
    const k = monthKey(e.date);
    monthMap.set(k, (monthMap.get(k) ?? 0) + e.amount);
  }
  const byMonth = [...monthMap.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const dates = expenses.map((e) => e.date).sort();
  const largestExpense = expenses.reduce((best, e) =>
    e.amount > (best?.amount ?? 0) ? e : best
  );

  return {
    totalSpend,
    count: expenses.length,
    categoryTotals,
    byMonth,
    averagePerTransaction: totalSpend / expenses.length,
    largestExpense,
    dateRange: { min: dates[0] ?? null, max: dates[dates.length - 1] ?? null },
  };
}

/** Detect simple anomalies: amounts > 2.5x category median within last 90 days */
export function detectAnomalies(expenses: Expense[]): Expense[] {
  const now = Date.now();
  const cutoff = now - 90 * 24 * 60 * 60 * 1000;
  const recent = expenses.filter((e) => new Date(e.date).getTime() >= cutoff);
  const byCat = new Map<string, number[]>();
  for (const e of recent) {
    const arr = byCat.get(e.category) ?? [];
    arr.push(e.amount);
    byCat.set(e.category, arr);
  }
  const out: Expense[] = [];
  for (const e of recent) {
    const amounts = byCat.get(e.category) ?? [];
    if (amounts.length < 3) continue;
    const sorted = [...amounts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 1
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    if (median > 0 && e.amount > median * 2.5) out.push(e);
  }
  return out;
}
