import { Redis } from "@upstash/redis";
import type { Expense } from "./types";

const STORAGE_KEY = "expenses:v1";

export type MemoryStore = {
  expenses: Expense[];
};

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const memory: MemoryStore = { expenses: [] };

async function readAll(): Promise<Expense[]> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<Expense[] | string>(STORAGE_KEY);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as Expense[];
      } catch {
        return [];
      }
    }
    return [];
  }
  return [...memory.expenses];
}

async function writeAll(expenses: Expense[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(STORAGE_KEY, JSON.stringify(expenses));
    return;
  }
  memory.expenses = expenses;
}

export async function listExpenses(): Promise<Expense[]> {
  const all = await readAll();
  return all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getExpense(id: string): Promise<Expense | undefined> {
  const all = await readAll();
  return all.find((e) => e.id === id);
}

export async function saveExpense(expense: Expense): Promise<void> {
  const all = await readAll();
  const idx = all.findIndex((e) => e.id === expense.id);
  if (idx >= 0) all[idx] = expense;
  else all.push(expense);
  await writeAll(all);
}

export async function deleteExpense(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((e) => e.id !== id);
  if (next.length === all.length) return false;
  await writeAll(next);
  return true;
}
export function isUsingMemoryStore(): boolean {
  return getRedis() === null;
}

