import { NextResponse } from "next/server";
import {
  deleteExpense,
  getExpense,
  saveExpense,
} from "@/lib/expense-store";
import type { ExpenseInput } from "@/lib/types";

export const runtime = "nodejs";

function validatePartial(body: unknown): Partial<ExpenseInput> | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const out: Partial<ExpenseInput> = {};
  if ("amount" in o) {
    const amount = o.amount;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)
      return null;
    out.amount = amount;
  }
  if ("category" in o) {
    const category = o.category;
    if (typeof category !== "string" || !category.trim()) return null;
    out.category = category.trim();
  }
  if ("date" in o) {
    const date = o.date;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return null;
    out.date = date;
  }
  if ("description" in o) {
    const description = o.description;
    if (typeof description !== "string") return null;
    out.description = description.trim();
  }
  return Object.keys(out).length ? out : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const existing = await getExpense(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const json = await request.json();
    const partial = validatePartial(json);
    if (!partial) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }
    const updated = {
      ...existing,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    await saveExpense(updated);
    return NextResponse.json({ expense: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ok = await deleteExpense(id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}
