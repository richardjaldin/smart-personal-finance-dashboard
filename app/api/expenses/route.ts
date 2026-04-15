import { NextResponse } from "next/server";
import { listExpenses, saveExpense } from "@/lib/expense-store";
import type { ExpenseInput } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const expenses = await listExpenses();
    return NextResponse.json({ expenses });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load expenses" },
      { status: 500 }
    );
  }
}

function validateBody(body: unknown): ExpenseInput | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const amount = o.amount;
  const category = o.category;
  const date = o.date;
  const description = o.description;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)
    return null;
  if (typeof category !== "string" || !category.trim()) return null;
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return null;
  if (typeof description !== "string") return null;
  return {
    amount,
    category: category.trim(),
    date,
    description: description.trim(),
  };
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = validateBody(json);
    if (!input) {
      return NextResponse.json({ error: "Invalid expense payload" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const expense = {
      id,
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    await saveExpense(expense);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
