import { NextResponse } from "next/server";
import { isUsingMemoryStore } from "@/lib/expense-store";

export const runtime = "nodejs";

export async function GET() {
  const memory = isUsingMemoryStore();
  return NextResponse.json({
    persistence: memory ? "memory" : "redis",
    message: memory
      ? "Redis is not configured. Data is stored in server memory and may reset between deploys or scale across instances. Set KV_REST_API_URL and KV_REST_API_TOKEN for durable storage."
      : "Using Upstash Redis for durable storage.",
  });
}
