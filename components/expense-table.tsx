"use client";

import { Pencil, Trash2 } from "lucide-react";
import type { Expense } from "@/lib/types";

type Props = {
  expenses: Expense[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
};

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  busyId,
}: Props) {
  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-10 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
        No expenses yet. Add your first entry above.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100/80 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {expenses.map((e) => (
              <tr
                key={e.id}
                className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-zinc-800 dark:text-zinc-200">
                  {e.date}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200">
                    {e.category}
                  </span>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {e.description || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                  ${e.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(e)}
                    className="mr-2 inline-flex rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-indigo-400"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={busyId === e.id}
                    onClick={() => onDelete(e.id)}
                    className="inline-flex rounded-lg p-2 text-zinc-600 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
