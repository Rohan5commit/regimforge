import type { MarketContext } from "@/regime/classifiers";
import { clamp } from "@/lib/utils";

export interface RegimeSignals {
  momentum: number;
  sentiment: number;
  volatility: number;
  derivatives: number;
  onchain: number;
}

export function computeRegimeSignals(ctx: MarketContext): RegimeSignals {
  let momentum = 0;
  if (ctx.price_change_24h !== undefined) momentum += clamp(ctx.price_change_24h / 10, -0.5, 0.5);
  if (ctx.price_change_7d !== undefined) momentum += clamp(ctx.price_change_7d / 20, -0.5, 0.5);
  if (ctx.rsi_14 !== undefined) momentum += clamp((ctx.rsi_14 - 50) / 50, -0.3, 0.3);
  let sentiment = 0;
  if (ctx.fear_greed_index !== undefined) sentiment += clamp((ctx.fear_greed_index - 50) / 50, -0.5, 0.5);
  if (ctx.social_volume_change !== undefined) sentiment += clamp(ctx.social_volume_change / 100, -0.3, 0.3);
  let volatility = 0;
  if (ctx.volatility_30d !== undefined) volatility = clamp((ctx.volatility_30d - 30) / 40, -0.5, 0.5);
  if (ctx.high_24h !== undefined && ctx.low_24h !== undefined && ctx.price > 0) {
    volatility += clamp(((ctx.high_24h - ctx.low_24h) / ctx.price) * 5 - 0.25, -0.3, 0.3);
  }
  let derivatives = 0;
  if (ctx.funding_rate !== undefined) derivatives += clamp(ctx.funding_rate * 100, -0.5, 0.5);
  if (ctx.open_interest_change !== undefined) derivatives += clamp(ctx.open_interest_change / 50, -0.3, 0.3);
  let onchain = 0;
  if (ctx.active_addresses_change !== undefined) onchain += clamp(ctx.active_addresses_change / 50, -0.4, 0.4);
  if (ctx.exchange_flow_net !== undefined) onchain -= clamp(ctx.exchange_flow_net / 100, -0.3, 0.3);
  return { momentum: clamp(momentum, -1, 1), sentiment: clamp(sentiment, -1, 1), volatility: clamp(volatility, -1, 1), derivatives: clamp(derivatives, -1, 1), onchain: clamp(onchain, -1, 1) };
}