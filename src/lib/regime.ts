/**
 * Regime Classifier - Deterministic pre-processing + AI classification
 * Combines technical indicators to produce regime signals
 */
import { z } from "zod";
import type { MarketContext } from "./schemas";

export interface RegimeSignals {
  momentum: number; // -1 to 1
  sentiment: number; // -1 to 1
  volatility: number; // -1 to 1
  derivatives: number; // -1 to 1
  onchain: number; // -1 to 1
}

const RegimeSignalsSchema = z.object({
  momentum: z.number().min(-1).max(1),
  sentiment: z.number().min(-1).max(1),
  volatility: z.number().min(-1).max(1),
  derivatives: z.number().min(-1).max(1),
  onchain: z.number().min(-1).max(1),
});

export const RegimeClassificationSchema = z.object({
  regime: z.enum([
    "TREND_UP",
    "TREND_DOWN",
    "MEAN_REVERT_UP",
    "MEAN_REVERT_DOWN",
    "HIGH_VOL_BREAKOUT",
    "CHOP",
  ]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  primary_signal: z.string(),
  signal_scores: RegimeSignalsSchema,
});

export type RegimeClassification = z.infer<typeof RegimeClassificationSchema>;

/**
 * Compute deterministic regime signals from market context
 */
export function computeRegimeSignals(ctx: MarketContext): RegimeSignals {
  // Momentum signal
  let momentum = 0;
  if (ctx.price_change_24h !== undefined) {
    momentum += clamp(ctx.price_change_24h / 10, -0.5, 0.5);
  }
  if (ctx.price_change_7d !== undefined) {
    momentum += clamp(ctx.price_change_7d / 20, -0.5, 0.5);
  }
  if (ctx.rsi_14 !== undefined) {
    // RSI: 50 is neutral, <30 oversold, >70 overbought
    momentum += clamp((ctx.rsi_14 - 50) / 50, -0.3, 0.3);
  }

  // Sentiment signal
  let sentiment = 0;
  if (ctx.fear_greed_index !== undefined) {
    sentiment += clamp((ctx.fear_greed_index - 50) / 50, -0.5, 0.5);
  }
  if (ctx.social_volume_change !== undefined) {
    sentiment += clamp(ctx.social_volume_change / 100, -0.3, 0.3);
  }

  // Volatility signal
  let volatility = 0;
  if (ctx.volatility_30d !== undefined) {
    volatility = clamp((ctx.volatility_30d - 30) / 40, -0.5, 0.5);
  }
  if (ctx.high_24h !== undefined && ctx.low_24h !== undefined && ctx.price > 0) {
    const range = (ctx.high_24h - ctx.low_24h) / ctx.price;
    volatility += clamp(range * 5 - 0.25, -0.3, 0.3);
  }

  // Derivatives signal
  let derivatives = 0;
  if (ctx.funding_rate !== undefined) {
    derivatives += clamp(ctx.funding_rate * 100, -0.5, 0.5);
  }
  if (ctx.open_interest_change !== undefined) {
    derivatives += clamp(ctx.open_interest_change / 50, -0.3, 0.3);
  }

  // On-chain signal
  let onchain = 0;
  if (ctx.active_addresses_change !== undefined) {
    onchain += clamp(ctx.active_addresses_change / 50, -0.4, 0.4);
  }
  if (ctx.exchange_flow_net !== undefined) {
    // Negative exchange flow = bullish (coins leaving exchanges)
    onchain -= clamp(ctx.exchange_flow_net / 100, -0.3, 0.3);
  }

  return {
    momentum: clamp(momentum, -1, 1),
    sentiment: clamp(sentiment, -1, 1),
    volatility: clamp(volatility, -1, 1),
    derivatives: clamp(derivatives, -1, 1),
    onchain: clamp(onchain, -1, 1),
  };
}

/**
 * Deterministic regime pre-classification
 * Used as a hint for the AI, or as a fallback
 */
export function deterministicRegime(signals: RegimeSignals): {
  regime: string;
  confidence: number;
} {
  const avg = (signals.momentum + signals.sentiment + signals.derivatives + signals.onchain) / 4;
  const vol = Math.abs(signals.volatility);

  // High volatility breakout
  if (vol > 0.4 && Math.abs(signals.momentum) > 0.3) {
    return {
      regime: "HIGH_VOL_BREAKOUT",
      confidence: clamp(0.4 + vol * 0.4, 0.3, 0.8),
    };
  }

  // Strong trend
  if (Math.abs(avg) > 0.25 && signals.momentum * avg > 0) {
    return {
      regime: avg > 0 ? "TREND_UP" : "TREND_DOWN",
      confidence: clamp(0.4 + Math.abs(avg) * 0.4, 0.3, 0.85),
    };
  }

  // Mean reversion (momentum vs sentiment divergence)
  const divergence = signals.momentum - signals.sentiment;
  if (Math.abs(divergence) > 0.3) {
    return {
      regime: divergence > 0 ? "MEAN_REVERT_DOWN" : "MEAN_REVERT_UP",
      confidence: clamp(0.3 + Math.abs(divergence) * 0.3, 0.25, 0.7),
    };
  }

  // Chop
  return {
    regime: "CHOP",
    confidence: clamp(0.3 + (1 - Math.abs(avg)) * 0.3, 0.2, 0.6),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
