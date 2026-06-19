import { NextRequest, NextResponse } from "next/server";
import { MarketContextSchema } from "@/regime/classifiers";
import { regimeForgeSkill } from "@/skill/cmc-skill";
import { DEMO_PRESETS } from "@/data/cmc-client";

/* ------------------------------------------------------------------
 * Simple in-memory rate limiter (sliding window per IP).
 * Resets on cold start — acceptable for a demo/hackathon.
 * ------------------------------------------------------------------ */
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): { ok: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { ok: true };
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { ok: false, retryAfterMs };
  }
  return { ok: true };
}

/* ------------------------------------------------------------------
 * Request body size cap (16 KB)
 * ------------------------------------------------------------------ */
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  // --- Auth check (production only) ---
  const demoToken = process.env.DEMO_TOKEN;
  if (process.env.NODE_ENV === "production" && demoToken) {
    const provided = req.headers.get("x-demo-token");
    if (provided !== demoToken) {
      return NextResponse.json(
        { error: "Unauthorized. Provide a valid x-demo-token header." },
        { status: 401 },
      );
    }
  }

  // --- Rate limiting ---
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const { ok, retryAfterMs } = checkRateLimit(ip);
  if (!ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${Math.ceil((retryAfterMs || 0) / 1000)}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((retryAfterMs || 0) / 1000)) },
      },
    );
  }

  // --- Body size validation ---
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: `Request too large. Maximum size is ${MAX_BODY_BYTES / 1024}KB.` },
      { status: 413 },
    );
  }

  try {
    const body = await req.json();
    const { symbol, preset, useAI, runBacktest, backtestBars, context } = body;

    let resolvedContext;
    if (preset && DEMO_PRESETS[preset]) {
      resolvedContext = DEMO_PRESETS[preset];
    } else if (context) {
      const parsed = MarketContextSchema.safeParse(context);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid market context", details: parsed.error.flatten() },
          { status: 400 },
        );
      }
      resolvedContext = parsed.data;
    } else if (symbol && DEMO_PRESETS[symbol]) {
      resolvedContext = DEMO_PRESETS[symbol];
    } else {
      return NextResponse.json(
        { error: "Provide a valid 'preset' or 'context' in the request body." },
        { status: 400 },
      );
    }

    const result = await regimeForgeSkill(resolvedContext, {
      useAI: useAI ?? true,
      runBacktest: runBacktest ?? true,
      backtestBars: backtestBars ?? 200,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Skill execution error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
