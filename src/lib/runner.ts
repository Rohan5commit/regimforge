/**
 * Orchestration Runner
 * Coordinates the full skill pipeline: context → regime → strategy → validate → critique → backtest
 */
import type { MarketContext, StrategySpec, SkillOutput, Explanation, BacktestResult } from "./schemas";
import { StrategySpecSchema } from "./schemas";
import { computeRegimeSignals, deterministicRegime } from "./regime";
import { nimChatJSON } from "./nim-client";
import {
  buildRegimeClassificationMessages,
  buildStrategyGenerationMessages,
  buildCritiqueMessages,
} from "./prompts";
import { validateStrategy } from "./validator";
import { buildExplanation } from "./explain";
import { runBacktest, generateSyntheticData } from "./backtest";
import { RegimeClassificationSchema } from "./regime";

export interface RunOptions {
  useAI?: boolean;
  runBacktest?: boolean;
  backtestBars?: number;
}

/**
 * Execute the full RegimeForge skill pipeline
 */
export async function runSkill(
  context: MarketContext,
  options: RunOptions = {}
): Promise<SkillOutput> {
  const { useAI = true, runBacktest: shouldBacktest = true, backtestBars = 200 } = options;

  // Step 1: Compute deterministic signals
  const signals = computeRegimeSignals(context);
  const detResult = deterministicRegime(signals);

  // Step 2: AI classification (or fallback to deterministic)
  let regimeData: { regime: string; confidence: number; reasoning: string; primary_signal: string; signal_scores: typeof signals };

  if (useAI) {
    try {
      const contextStr = formatContextForAI(context, signals, detResult);
      const messages = buildRegimeClassificationMessages(contextStr);
      regimeData = await nimChatJSON(messages, RegimeClassificationSchema, {
        temperature: 0.2,
      });
    } catch (e) {
      console.error("AI classification failed, using deterministic:", e);
      regimeData = {
        regime: detResult.regime as StrategySpec["regime"],
        confidence: detResult.confidence,
        reasoning: `Deterministic classification (AI unavailable): ${detResult.regime} based on signal analysis`,
        primary_signal: "momentum",
        signal_scores: signals,
      };
    }
  } else {
    regimeData = {
      regime: detResult.regime as StrategySpec["regime"],
      confidence: detResult.confidence,
      reasoning: `Deterministic classification: ${detResult.regime}`,
      primary_signal: "momentum",
      signal_scores: signals,
    };
  }

  // Step 3: Generate strategy
  let strategy: StrategySpec;

  if (useAI) {
    try {
      const regimeStr = JSON.stringify(regimeData, null, 2);
      const contextStr = formatContextForAI(context, signals, detResult);
      const messages = buildStrategyGenerationMessages(regimeStr, contextStr);
      strategy = await nimChatJSON(messages, StrategySpecSchema, {
        temperature: 0.3,
      });
    } catch (e) {
      console.error("AI strategy generation failed, using deterministic fallback:", e);
      strategy = generateDeterministicStrategy(regimeData.regime as StrategySpec["regime"], regimeData.confidence, context);
    }
  } else {
    strategy = generateDeterministicStrategy(regimeData.regime as StrategySpec["regime"], regimeData.confidence, context);
  }

  // Step 4: Validate
  const validation = validateStrategy(strategy);
  if (!validation.valid) {
    // Try to fix common issues
    if (strategy.regime === "CHOP") {
      strategy.directional_bias = "NEUTRAL";
      strategy.sizing_guidance = "ZERO";
    }
    // Re-validate after fixes
    const revalidation = validateStrategy(strategy);
    if (!revalidation.valid && useAI) {
      // Try one more time with critique
      try {
        const critiqueMessages = buildCritiqueMessages(JSON.stringify({ strategy, validation: revalidation }, null, 2));
        const critiqueResult = await nimChatJSON(critiqueMessages, StrategySpecSchema, {
          temperature: 0.2,
        });
        strategy = critiqueResult;
      } catch {
        // Use what we have
      }
    }
  }

  // Step 5: Build explanation
  const explanation = buildExplanation(signals, strategy, regimeData.reasoning);

  // Step 6: Backtest
  let backtestResult: BacktestResult | undefined;
  if (shouldBacktest) {
    const historicalData = generateSyntheticData(strategy.regime, backtestBars);
    backtestResult = runBacktest(strategy, historicalData);
  }

  return {
    strategy,
    explanation,
    backtest: backtestResult,
    timestamp: new Date().toISOString(),
    symbol: context.symbol,
  };
}

function formatContextForAI(
  ctx: MarketContext,
  signals: ReturnType<typeof computeRegimeSignals>,
  detResult: ReturnType<typeof deterministicRegime>
): string {
  return `Symbol: ${ctx.symbol}
Price: $${ctx.price}
24h Change: ${ctx.price_change_24h}%
7d Change: ${ctx.price_change_7d ?? "N/A"}%
24h Volume: $${ctx.volume_24h?.toLocaleString() ?? "N/A"}
Market Cap: $${ctx.market_cap?.toLocaleString() ?? "N/A"}
RSI (14): ${ctx.rsi_14 ?? "N/A"}
MACD: ${ctx.macd ?? "N/A"}
Volatility (30d): ${ctx.volatility_30d ?? "N/A"}%
Funding Rate: ${ctx.funding_rate ?? "N/A"}
Fear/Greed Index: ${ctx.fear_greed_index ?? "N/A"}
Social Volume Change: ${ctx.social_volume_change ?? "N/A"}%
Active Addresses Change: ${ctx.active_addresses_change ?? "N/A"}%
Exchange Flow Net: ${ctx.exchange_flow_net ?? "N/A"}

Computed Signals:
- Momentum: ${signals.momentum.toFixed(3)}
- Sentiment: ${signals.sentiment.toFixed(3)}
- Volatility: ${signals.volatility.toFixed(3)}
- Derivatives: ${signals.derivatives.toFixed(3)}
- On-chain: ${signals.onchain.toFixed(3)}

Deterministic Pre-classification: ${detResult.regime} (confidence: ${detResult.confidence.toFixed(2)})`;
}

function generateDeterministicStrategy(
  regime: string,
  confidence: number,
  ctx: MarketContext
): StrategySpec {
  const base: StrategySpec = {
    regime: regime as StrategySpec["regime"],
    directional_bias: "NEUTRAL",
    confidence,
    setup_name: "Deterministic Fallback",
    indicators_used: ["SMA-20", "SMA-50", "RSI-14"],
    entry_rules: [],
    exit_rules: [],
    invalidation_rules: [],
    sizing_guidance: "ZERO",
    holding_horizon: "SWING",
    do_not_trade_conditions: [],
    rationale: "Generated deterministically (AI unavailable)",
    evidence_summary: [],
  };

  switch (regime) {
    case "TREND_UP":
      base.directional_bias = "LONG";
      base.setup_name = "Trend Continuation Long";
      base.sizing_guidance = confidence > 0.6 ? "MEDIUM" : "SMALL";
      base.entry_rules = [
        "Price pulls back to SMA-20 from above",
        "RSI(14) between 40 and 60",
        "Price remains above SMA-50",
      ];
      base.exit_rules = [
        "RSI(14) exceeds 75",
        "Price closes below SMA-50",
        "Trailing stop at 2x ATR(14)",
      ];
      base.invalidation_rules = ["Price closes below SMA-50 with volume spike"];
      base.do_not_trade_conditions = ["RSI > 80 (overbought)", "Volume drops below 50% of 20-day average"];
      break;
    case "TREND_DOWN":
      base.directional_bias = "SHORT";
      base.setup_name = "Trend Continuation Short";
      base.sizing_guidance = confidence > 0.6 ? "MEDIUM" : "SMALL";
      base.entry_rules = [
        "Price bounces to SMA-20 from below",
        "RSI(14) between 40 and 60",
        "Price remains below SMA-50",
      ];
      base.exit_rules = [
        "RSI(14) drops below 25",
        "Price closes above SMA-50",
        "Trailing stop at 2x ATR(14)",
      ];
      base.invalidation_rules = ["Price closes above SMA-50 with volume spike"];
      base.do_not_trade_conditions = ["RSI < 20 (oversold bounce risk)", "Volume drops below 50% of 20-day average"];
      break;
    case "MEAN_REVERT_UP":
      base.directional_bias = "LONG";
      base.setup_name = "Oversold Bounce";
      base.sizing_guidance = "SMALL";
      base.entry_rules = [
        "RSI(14) drops below 30",
        "Price shows bullish candle (close > open)",
        "Price is >15% below 20-day high",
      ];
      base.exit_rules = [
        "RSI(14) reaches 55",
        "Price reaches SMA-20",
        "Stop loss at 5% below entry",
      ];
      base.invalidation_rules = ["Price makes new low with RSI making new low"];
      base.do_not_trade_conditions = ["Macro event within 24h", "Volume below average"];
      break;
    case "MEAN_REVERT_DOWN":
      base.directional_bias = "SHORT";
      base.setup_name = "Overbought Fade";
      base.sizing_guidance = "SMALL";
      base.entry_rules = [
        "RSI(14) rises above 70",
        "Price shows bearish candle (close < open)",
        "Price is >15% above 20-day low",
      ];
      base.exit_rules = [
        "RSI(14) drops to 45",
        "Price reaches SMA-20",
        "Stop loss at 5% above entry",
      ];
      base.invalidation_rules = ["Price makes new high with RSI making new high"];
      base.do_not_trade_conditions = ["Strong momentum with rising volume", "Funding rate deeply negative"];
      break;
    case "HIGH_VOL_BREAKOUT":
      base.directional_bias = "NEUTRAL";
      base.setup_name = "Volatility Breakout";
      base.sizing_guidance = "SMALL";
      base.entry_rules = [
        "Price breaks above 20-bar high OR below 20-bar low",
        "ATR(14) > 150% of 20-day average",
        "Volume > 200% of 20-day average",
      ];
      base.exit_rules = [
        "Price retraces 50% of breakout move",
        "ATR(14) contracts to below average",
        "Stop at breakout level",
      ];
      base.invalidation_rules = ["Breakout fails within 3 bars (fakeout)"];
      base.do_not_trade_conditions = ["ATR below average", "Low volume environment"];
      break;
    case "CHOP":
    default:
      base.directional_bias = "NEUTRAL";
      base.setup_name = "No Trade — Choppy Market";
      base.sizing_guidance = "ZERO";
      base.entry_rules = ["No entry — market is choppy"];
      base.exit_rules = ["No position to exit"];
      base.invalidation_rules = [];
      base.do_not_trade_conditions = [
        "Range-bound price action",
        "Mixed or contradictory signals",
        "No clear regime",
      ];
      base.evidence_summary = ["All signals neutral or conflicting", "Correct action is to stay flat"];
      break;
  }

  base.evidence_summary = [
    `Regime: ${regime}`,
    `Confidence: ${(confidence * 100).toFixed(0)}%`,
    `Direction: ${base.directional_bias}`,
  ];

  return base;
}
