"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Table2,
} from "lucide-react";
import { buildSummary } from "@/lib/aggregates";
import {
  createExpense,
  fetchExpenses,
  fetchInsights,
  removeExpense,
  updateExpense,
} from "@/lib/api-client";
import type { Expense, ExpenseInput } from "@/lib/types";
import { ExpenseCharts } from "./expense-charts";
import { ExpenseForm } from "./expense-form";
import { ExpenseTable } from "./expense-table";
import { InsightsPanel } from "./insights-panel";

type Tab = "dashboard" | "table" | "charts";

export function FinanceDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const list = await fetchExpenses();
      setExpenses(list);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void fetch("/api/status")
      .then((r) => r.json())
      .then(
        (d: { persistence?: string; message?: string }) => {
          if (d.persistence === "memory" && d.message) setStorageWarning(d.message);
        }
      )
      .catch(() => {});
  }, []);

  const summary = useMemo(() => buildSummary(expenses), [expenses]);

  async function handleAdd(input: ExpenseInput) {
    if (editing) {
      await updateExpense(editing.id, input);
      setEditing(null);
    } else {
      await createExpense(input);
    }
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this expense?")) return;
    setBusyId(id);
    try {
      await removeExpense(id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function loadInsights() {
    const res = await fetchInsights();
    return res.markdown;
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "table", label: "Table", icon: Table2 },
    { id: "charts", label: "Charts", icon: BarChart3 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Smart Personal Finance Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Your spending, clarified
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Track expenses, explore trends with charts, and get grounded AI
          insights tailored to your history.
        </p>
      </header>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {loadError}
        </div>
      )}

      {storageWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <strong className="font-semibold">Storage:</strong> {storageWarning}
        </div>
      )}

      <nav className="flex flex-wrap gap-2" aria-label="Views">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === id
                ? "bg-indigo-600 text-white shadow"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading expenses…</p>
      ) : (
        <>
          {tab === "dashboard" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-1">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Total spend
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  $
                  {summary.totalSpend.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {summary.count} transaction
                  {summary.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-1">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Average per entry
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                  $
                  {summary.averagePerTransaction.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {summary.largestExpense && (
                  <p className="mt-2 text-sm text-zinc-500">
                    Largest: ${summary.largestExpense.amount.toFixed(2)} (
                    {summary.largestExpense.category})
                  </p>
                )}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-1">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Top category
                </p>
                <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {summary.categoryTotals[0]?.category ?? "—"}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {summary.categoryTotals[0]
                    ? `$${summary.categoryTotals[0].total.toFixed(2)}`
                    : "Add data to see categories"}
                </p>
              </div>
            </div>
          )}

          {tab === "dashboard" && expenses.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Recent activity
              </h2>
              <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                {expenses.slice(0, 5).map((e) => (
                  <li
                    key={e.id}
                    className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-x-3 gap-y-1 py-2 text-sm sm:grid-cols-[7rem_8rem_1fr_5rem]"
                  >
                    <span className="text-zinc-500">{e.date}</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {e.category}
                    </span>
                    <span className="min-w-0 truncate text-zinc-600 dark:text-zinc-400">
                      {e.description || "—"}
                    </span>
                    <span className="text-right tabular-nums text-zinc-800 dark:text-zinc-200">
                      ${e.amount.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "charts" && <ExpenseCharts summary={summary} />}

          {tab === "table" && (
            <ExpenseTable
              expenses={expenses}
              onEdit={(e) => {
                setEditing(e);
                setTab("dashboard");
              }}
              onDelete={handleDelete}
              busyId={busyId}
            />
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseForm
              key={editing?.id ?? "new"}
              initial={editing}
              onSubmit={handleAdd}
              onCancel={
                editing
                  ? () => {
                      setEditing(null);
                    }
                  : undefined
              }
            />
            <InsightsPanel onGenerate={loadInsights} />
          </div>

          {tab === "table" && (
            <p className="text-center text-xs text-zinc-500">
              Tip: use <strong>Dashboard</strong> to add or edit entries after
              clicking edit.
            </p>
          )}
        </>
      )}
    </div>
  );
}
