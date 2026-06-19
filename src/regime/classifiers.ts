/**
 * Strategy Schema - The core output contract for RegimeForge
 * This defines the structured strategy spec that the skill emits.
 */
import { z } from "zod";

export const RegimeEnum = z.enum([
  "TREND_UP",
  "TREND_DOWN",
  "MEAN_REVERT_UP",
  "MEAN_REVERT_DOWN",
  "HIGH_VOL_BREAKOUT",
  "CHOP",
]);

export const DirectionalBiasEnum = z.enum(["LONG", "SHORT", "NEUTRAL"]);

export const SizingGuidanceEnum = z.enum(["ZERO", "SMALL", "MEDIUM"]);

export const HoldingHorizonEnum = z.enum(["INTRADAY", "SWING", "MULTI_DAY"]);

export const StrategySpecSchema = z.object({
  regime: RegimeEnum,
  directional_bias: DirectionalBiasEnum,
  confidence: z.number().min(0).max(1),
  setup_name: z.string().min(1),
  indicators_used: z.array(z.string()),
  entry_rules: z.array(z.string()),
  exit_rules: z.array(z.string()),
  invalidation_rules: z.array(z.string()),
  sizing_guidance: SizingGuidanceEnum,
  holding_horizon: HoldingHorizonEnum,
  do_not_trade_conditions: z.array(z.string()),
  rationale: z.string(),
  evidence_summary: z.array(z.string()),
});

export type StrategySpec = z.infer<typeof StrategySpecSchema>;
export type Regime = z.infer<typeof RegimeEnum>;
export type DirectionalBias = z.infer<typeof DirectionalBiasEnum>;
export type SizingGuidance = z.infer<typeof SizingGuidanceEnum>;
export type HoldingHorizon = z.infer<typeof HoldingHorizonEnum>;

/**
 * Market Context - Input to the skill
 */
export const MarketContextSchema = z.object({
  symbol: z.string().min(1),
  name: z.string().optional(),
  price: z.number(),
  price_change_24h: z.number(),
  price_change_7d: z.number().optional(),
  volume_24h: z.number(),
  volume_change_24h: z.number().optional(),
  market_cap: z.number().optional(),
  market_cap_change_24h: z.number().optional(),
  high_24h: z.number().optional(),
  low_24h: z.number().optional(),
  volatility_30d: z.number().optional(),
  rsi_14: z.number().optional(),
  macd: z.number().optional(),
  macd_signal: z.number().optional(),
  funding_rate: z.number().optional(),
  open_interest_change: z.number().optional(),
  fear_greed_index: z.number().optional(),
  social_volume_change: z.number().optional(),
  active_addresses_change: z.number().optional(),
  exchange_flow_net: z.number().optional(),
  historical_prices: z.array(z.number()).optional(),
  historical_volumes: z.array(z.number()).optional(),
});

export type MarketContext = z.infer<typeof MarketContextSchema>;

/**
 * Explainability output
 */
export const ExplanationSchema = z.object({
  regime_reasoning: z.string(),
  signal_weights: z.array(
    z.object({
      signal: z.string(),
      weight: z.number().min(0).max(1),
      contribution: z.string(),
    })
  ),
  weak_points: z.array(z.string()),
  inactive_conditions: z.array(z.string()),
  thesis_invalidators: z.array(z.string()),
});

export type Explanation = z.infer<typeof ExplanationSchema>;

/**
 * Backtest result
 */
export const BacktestResultSchema = z.object({
  total_return: z.number(),
  max_drawdown: z.number(),
  trade_count: z.number(),
  win_rate: z.number(),
  avg_holding_period: z.string(),
  sharpe_ratio: z.number().optional(),
  profit_factor: z.number().optional(),
  summary: z.string(),
  equity_curve: z.array(z.number()),
  trades: z.array(
    z.object({
      entry_price: z.number(),
      exit_price: z.number(),
      direction: z.string(),
      return_pct: z.number(),
      holding_bars: z.number(),
    })
  ),
});

export type BacktestResult = z.infer<typeof BacktestResultSchema>;

/**
 * Full skill output combining strategy, explanation, and backtest
 */
export const SkillOutputSchema = z.object({
  strategy: StrategySpecSchema,
  explanation: ExplanationSchema,
  backtest: BacktestResultSchema.optional(),
  timestamp: z.string(),
  symbol: z.string(),
  validation: z.object({
    valid: z.boolean(),
    issues: z.array(z.string()),
    warnings: z.array(z.string()),
  }).optional(),
});

export type SkillOutput = z.infer<typeof SkillOutputSchema>;
