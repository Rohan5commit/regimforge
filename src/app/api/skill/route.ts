import { NextRequest, NextResponse } from "next/server";
import { MarketContextSchema } from "@/regime/classifiers";
import { regimeForgeSkill } from "@/skill/cmc-skill";
import { DEMO_PRESETS } from "@/data/cmc-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symbol, preset, useAI, runBacktest, backtestBars } = body;
    let context;
    if (preset && DEMO_PRESETS[preset.toUpperCase()]) context = DEMO_PRESETS[preset.toUpperCase()];
    else if (symbol && body.context) context = MarketContextSchema.parse(body.context);
    else if (symbol && DEMO_PRESETS[symbol.toUpperCase()]) context = DEMO_PRESETS[symbol.toUpperCase()];
    else return NextResponse.json({ error: "Provide preset (BTC, ETH, SOL, BNB, DOGE) or symbol + context" }, { status: 400 });
    const result = await regimeForgeSkill(context, { useAI: useAI !== false, runBacktest: runBacktest !== false, backtestBars: backtestBars || 200 });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Skill error:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}