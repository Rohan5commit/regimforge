import type { StrategySpec, Explanation } from "@/regime/classifiers";
import type { RegimeSignals } from "@/regime/features";

export function buildExplanation(signals: RegimeSignals, strategy: StrategySpec, regimeReasoning: string): Explanation {
  const entries = [
    { signal: "Momentum", weight: Math.abs(signals.momentum), value: signals.momentum },
    { signal: "Sentiment", weight: Math.abs(signals.sentiment), value: signals.sentiment },
    { signal: "Volatility", weight: Math.abs(signals.volatility), value: signals.volatility },
    { signal: "Derivatives", weight: Math.abs(signals.derivatives), value: signals.derivatives },
    { signal: "On-chain", weight: Math.abs(signals.onchain), value: signals.onchain },
  ].sort((a, b) => b.weight - a.weight);
  const total = entries.reduce((s, e) => s + e.weight, 0) || 1;
  const signalWeights = entries.map(e => ({ signal: e.signal, weight: Math.round((e.weight / total) * 100) / 100, contribution: `${e.value > 0 ? "bullish" : e.value < 0 ? "bearish" : "neutral"} (score: ${e.value.toFixed(2)})` }));
  const weakPoints: string[] = [];
  if (strategy.confidence < 0.5) weakPoints.push("Overall confidence below 50% — signals mixed");
  if (signals.momentum * signals.sentiment < -0.2) weakPoints.push("Momentum and sentiment diverging");
  if (Math.abs(signals.derivatives) < 0.1) weakPoints.push("Derivatives data neutral");
  if (signals.volatility > 0.5) weakPoints.push("Elevated volatility increases whipsaw risk");
  return { regime_reasoning: regimeReasoning, signal_weights: signalWeights, weak_points: weakPoints, inactive_conditions: strategy.do_not_trade_conditions, thesis_invalidators: strategy.invalidation_rules };
}