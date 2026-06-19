import { NextResponse } from "next/server";
import { getHealthData } from "@/lib/health-tracker";

/**
 * Live system health endpoint.
 * Returns NIM key status, model name, and system metadata.
 */
export async function GET() {
  const nimKeySet = !!process.env.NIM_API_KEY;
  const cmcKeySet = !!process.env.CMC_API_KEY;
  const model = process.env.NIM_MODEL || "meta/llama-3.3-70b-instruct";
  const tracker = getHealthData();

  return NextResponse.json({
    status: "ok",
    model,
    nim_configured: nimKeySet,
    cmc_configured: cmcKeySet,
    ...tracker,
    timestamp: new Date().toISOString(),
  });
}
