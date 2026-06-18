import { z } from "zod";
import type { RegimeSignals } from "@/regime/features";
import { clamp } from "@/lib/utils";

export const RegimeClassificationSchema = z.object({
  regime: z.enum(["TREND_UP","TREND_DOWN","MEAN_REVERT_UP","MEAN_REVERT_DOWN","HIGH_VOL_BREAKOUT","CHOP"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  primary_signal: z.string(),
  signal_scores: z.object({ momentum: z.number().min(-1).max(1), sentiment: z.number().min(-1).max(1), volatility: z.number().min(-1).max(1), derivatives: z.number().min(-1).max(1), onchain: z.number().min(-1).max(1) }),
});
export type RegimeClassification = z.infer<typeof RegimeClassificationSchema>;

export function deterministicRegime(signals: RegimeSignals): { regime: string; confidence: number } {
  const avg = (signals.momentum + signals.sentiment + signals.derivatives + signals.onchain) / 4;
  const vol = Math.abs(signals.volatility);
  // Check trends first - momentum must align with overall direction
  if (Math.abs(avg) > 0.3 && signals.momentum * avg > 0 && Math.abs(signals.momentum) > 0.2) return { regime: avg > 0 ? "TREND_UP" : "TREND_DOWN", confidence: clamp(0.4 + Math.abs(avg) * 0.4, 0.3, 0.85) };
  // Check mean reversion - momentum and sentiment diverging
  const divergence = signals.momentum - signals.sentiment;
  if (Math.abs(divergence) > 0.3) return { regime: divergence > 0 ? "MEAN_REVERT_DOWN" : "MEAN_REVERT_UP", confidence: clamp(0.3 + Math.abs(divergence) * 0.3, 0.25, 0.7) };
  // High volatility breakout - only if very high vol and no clear trend
  if (vol > 0.5 && Math.abs(signals.momentum) > 0.3) return { regime: "HIGH_VOL_BREAKOUT", confidence: clamp(0.4 + vol * 0.3, 0.3, 0.8) };
  return { regime: "CHOP", confidence: clamp(0.3 + (1 - Math.abs(avg)) * 0.3, 0.2, 0.6) };
}