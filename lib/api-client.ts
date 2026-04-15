import type { Expense, ExpenseInput } from "./types";

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch("/api/expenses", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load expenses");
  const data = (await res.json()) as { expenses: Expense[] };
  return data.expenses;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Create failed");
  }
  const data = (await res.json()) as { expense: Expense };
  return data.expense;
}

export async function updateExpense(
  id: string,
  partial: Partial<ExpenseInput>
): Promise<Expense> {
  const res = await fetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Update failed");
  }
  const data = (await res.json()) as { expense: Expense };
  return data.expense;
}

export async function removeExpense(id: string): Promise<void> {
  const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export type InsightsResponse = {
  markdown: string;
  summary: {
    totalSpend: number;
    count: number;
    categoryTotals: { category: string; total: number; count: number }[];
  };
};

export async function fetchInsights(): Promise<InsightsResponse> {
  const res = await fetch("/api/insights", { method: "POST" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Insights unavailable");
  }
  return res.json() as Promise<InsightsResponse>;
}
