import { NextResponse } from "next/server";
import { buildSummary, detectAnomalies } from "@/lib/aggregates";
import { listExpenses } from "@/lib/expense-store";
import { chatCompletion, getLlmConfigFromEnv } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const config = getLlmConfigFromEnv();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "LLM not configured. Set LLM_API_KEY (or OPENAI_API_KEY) in environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const expenses = await listExpenses();
    const summary = buildSummary(expenses);
    const anomalies = detectAnomalies(expenses);

    const dataPayload = {
      expenseCount: summary.count,
      totalSpend: summary.totalSpend,
      averagePerTransaction: summary.averagePerTransaction,
      dateRange: summary.dateRange,
      categoryTotals: summary.categoryTotals,
      monthlyTrend: summary.byMonth,
      anomalyCandidates: anomalies.map((e) => ({
        id: e.id,
        amount: e.amount,
        category: e.category,
        date: e.date,
        description: e.description,
      })),
      recentSample: expenses.slice(0, 40).map((e) => ({
        amount: e.amount,
        category: e.category,
        date: e.date,
        description: e.description,
      })),
    };

    const system = `You are a friendly personal finance analyst helping someone understand their spending. Be direct, concise, and conversational—suitable for research and academic reflection. Ground every point in the JSON data provided. If there is little or no data, say so briefly and suggest what to track next.

Output markdown with short sections:
- **Snapshot** (2–3 sentences on overall patterns)
- **Categories** (where money goes; percentages if clear from data)
- **Trends** (month-over-month if monthly data exists)
- **Watch list** (unusual or high-impact items, using anomalyCandidates when relevant)
- **Next steps** (2–4 actionable, realistic suggestions)

Do not invent transactions. Use USD for currency unless the data clearly implies otherwise.`;

    const user = `Expense analytics JSON:\n\`\`\`json\n${JSON.stringify(dataPayload, null, 2)}\n\`\`\``;

    const text = await chatCompletion(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      config
    );

    return NextResponse.json({
      markdown: text,
      summary: {
        totalSpend: summary.totalSpend,
        count: summary.count,
        categoryTotals: summary.categoryTotals,
      },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Insight generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
