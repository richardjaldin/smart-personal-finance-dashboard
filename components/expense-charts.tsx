"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import type { ExpenseSummary } from "@/lib/aggregates";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const palette = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#64748b",
];

type Props = {
  summary: ExpenseSummary;
};

export function ExpenseCharts({ summary }: Props) {
  const catLabels = summary.categoryTotals.map((c) => c.category);
  const catData = summary.categoryTotals.map((c) => c.total);
  const pieData = {
    labels: catLabels,
    datasets: [
      {
        data: catData,
        backgroundColor: catLabels.map((_, i) => palette[i % palette.length]),
        borderWidth: 0,
      },
    ],
  };

  const monthLabels = summary.byMonth.map((m) => m.month);
  const monthTotals = summary.byMonth.map((m) => m.total);
  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Spend",
        data: monthTotals,
        backgroundColor: "rgba(99, 102, 241, 0.65)",
        borderRadius: 6,
      },
    ],
  };

  if (summary.count === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        Add expenses to see category and monthly charts.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Spending by category
        </h3>
        <div className="mx-auto max-h-[320px] max-w-[320px]">
          <Pie
            data={pieData}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { boxWidth: 12, padding: 12 },
                },
              },
              maintainAspectRatio: true,
            }}
          />
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Monthly trend
        </h3>
        <Bar
          data={barData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (v) =>
                    typeof v === "number" ? `$${v.toLocaleString()}` : v,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
