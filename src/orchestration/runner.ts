import type { MarketContext, StrategySpec, SkillOutput } from "@/regime/classifiers";
import { StrategySpecSchema } from "@/regime/classifiers";
import { computeRegimeSignals } from "@/regime/features";
import { deterministicRegime, RegimeClassificationSchema } from "@/regime/classifier";
import { nimChatJSON } from "@/ai/nim-client";
import { buildRegimeClassificationMessages, buildStrategyGenerationMessages } from "@/skill/prompts";
import { validateStrategy } from "@/regime/validators";
import { generateDeterministicStrategy } from "@/skill/parser";
import { buildExplanation } from "@/ui/inspectors";
import { runBacktest } from "@/backtest/engine";
import { generateSyntheticData } from "@/backtest/scenarios";

export interface RunOptions { useAI?: boolean; runBacktest?: boolean; backtestBars?: number; }

function formatContextForAI(ctx: MarketContext, signals: ReturnType<typeof computeRegimeSignals>, det: ReturnType<typeof deterministicRegime>): string {
  return `Symbol: ${ctx.symbol}
Price: $${ctx.price}
24h Change: ${ctx.price_change_24h}%
7d Change: ${ctx.price_change_7d ?? "N/A"}%
Volume: $${ctx.volume_24h?.toLocaleString() ?? "N/A"}
RSI(14): ${ctx.rsi_14 ?? "N/A"}
Funding Rate: ${ctx.funding_rate ?? "N/A"}
Fear/Greed: ${ctx.fear_greed_index ?? "N/A"}

Signals:
Momentum: ${signals.momentum.toFixed(3)}
Sentiment: ${signals.sentiment.toFixed(3)}
Volatility: ${signals.volatility.toFixed(3)}
Derivatives: ${signals.derivatives.toFixed(3)}
On-chain: ${signals.onchain.toFixed(3)}

Det. Pre-classification: ${det.regime} (confidence: ${det.confidence.toFixed(2)})`;
}

export async function runSkill(context: MarketContext, options: RunOptions = {}): Promise<SkillOutput> {
  const { useAI = true, runBacktest: shouldBacktest = true, backtestBars = 200 } = options;
  const signals = computeRegimeSignals(context);
  const detResult = deterministicRegime(signals);
  let regimeData: { regime: string; confidence: number; reasoning: string; primary_signal: string; signal_scores: typeof signals };
  if (useAI) {
    try {
      const ctxStr = formatContextForAI(context, signals, detResult);
      regimeData = await nimChatJSON(buildRegimeClassificationMessages(ctxStr), RegimeClassificationSchema, { temperature: 0.2 });
    } catch (e) {
      console.error("AI classification failed, using deterministic:", e);
      regimeData = { regime: detResult.regime, confidence: detResult.confidence, reasoning: `Deterministic: ${detResult.regime}`, primary_signal: "momentum", signal_scores: signals };
    }
  } else {
    regimeData = { regime: detResult.regime, confidence: detResult.confidence, reasoning: `Deterministic: ${detResult.regime}`, primary_signal: "momentum", signal_scores: signals };
  }
  let strategy: StrategySpec;
  if (useAI) {
    try {
      strategy = await nimChatJSON(buildStrategyGenerationMessages(JSON.stringify(regimeData, null, 2), formatContextForAI(context, signals, detResult)), StrategySpecSchema, { temperature: 0.3 });
    } catch (e) {
      console.error("AI strategy failed, using deterministic:", e);
      strategy = generateDeterministicStrategy(regimeData.regime, regimeData.confidence);
    }
  } else {
    strategy = generateDeterministicStrategy(regimeData.regime, regimeData.confidence);
  }
  const validation = validateStrategy(strategy);
  if (!validation.valid && strategy.regime === "CHOP") { strategy.directional_bias = "NEUTRAL"; strategy.sizing_guidance = "ZERO"; }
  const explanation = buildExplanation(signals, strategy, regimeData.reasoning);
  let backtestResult = undefined;
  if (shouldBacktest) { backtestResult = runBacktest(strategy, generateSyntheticData(strategy.regime, backtestBars)); }
  return { strategy, explanation, backtest: backtestResult, timestamp: new Date().toISOString(), symbol: context.symbol };
}