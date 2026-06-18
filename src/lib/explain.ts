/**
 * Explainability Layer
 * Generates human-readable explanations for strategy decisions
 */
import type { StrategySpec, Explanation, Regime } from "./schemas";
import type { RegimeSignals } from "./regime";

/**
 * Build explanation from regime signals and strategy
 */
export function buildExplanation(
  signals: RegimeSignals,
  strategy: StrategySpec,
  regimeReasoning: string
): Explanation {
  // Rank signals by absolute contribution
  const signalEntries = [
    { signal: "Momentum", weight: Math.abs(signals.momentum), value: signals.momentum },
    { signal: "Sentiment", weight: Math.abs(signals.sentiment), value: signals.sentiment },
    { signal: "Volatility", weight: Math.abs(signals.volatility), value: signals.volatility },
    { signal: "Derivatives", weight: Math.abs(signals.derivatives), value: signals.derivatives },
    { signal: "On-chain", weight: Math.abs(signals.onchain), value: signals.onchain },
  ].sort((a, b) => b.weight - a.weight);

  const totalWeight = signalEntries.reduce((s, e) => s + e.weight, 0) || 1;

  const signalWeights = signalEntries.map((e) => ({
    signal: e.signal,
    weight: Math.round((e.weight / totalWeight) * 100) / 100,
    contribution: formatContribution(e.signal, e.value),
  }));

  // Identify weak points
  const weakPoints: string[] = [];
  if (strategy.confidence < 0.5) {
    weakPoints.push("Overall confidence is below 50% — signals are mixed or conflicting");
  }
  if (signals.momentum * signals.sentiment < -0.2) {
    weakPoints.push("Momentum and sentiment are diverging — potential false signal");
  }
  if (Math.abs(signals.derivatives) < 0.1) {
    weakPoints.push("Derivatives data is neutral — no conviction from futures/funding");
  }
  if (signals.volatility > 0.5) {
    weakPoints.push("Elevated volatility increases risk of whipsaw entries");
  }

  // Inactive conditions
  const inactiveConditions: string[] = [];
  if (strategy.do_not_trade_conditions.length > 0) {
    inactiveConditions.push(...strategy.do_not_trade_conditions);
  }
  if (strategy.regime === "CHOP") {
    inactiveConditions.push("Market is in a choppy, range-bound state");
    inactiveConditions.push("No clear directional bias — staying flat is the correct decision");
  }

  // Thesis invalidators
  const thesisInvalidators: string[] = [];
  thesisInvalidators.push(...strategy.invalidation_rules);
  if (strategy.regime === "TREND_UP") {
    thesisInvalidators.push("Price closes below 50-period SMA with increasing volume");
    thesisInvalidators.push("Regime shifts to CHOP or TREND_DOWN");
  }
  if (strategy.regime === "MEAN_REVERT_UP") {
    thesisInvalidators.push("RSI makes new lows below entry trigger");
    thesisInvalidators.push("Price breaks below recent swing low");
  }

  return {
    regime_reasoning: regimeReasoning,
    signal_weights: signalWeights,
    weak_points: weakPoints,
    inactive_conditions: inactiveConditions,
    thesis_invalidators: thesisInvalidators,
  };
}

function formatContribution(signal: string, value: number): string {
  const direction = value > 0 ? "bullish" : value < 0 ? "bearish" : "neutral";
  const strength =
    Math.abs(value) > 0.6
      ? "Strong"
      : Math.abs(value) > 0.3
        ? "Moderate"
        : Math.abs(value) > 0.1
          ? "Weak"
          : "Minimal";
  return `${strength} ${direction} signal (score: ${value.toFixed(2)})`;
}

/**
 * Format explanation for display
 */
export function formatExplanation(explanation: Explanation): string {
  const lines: string[] = [];
  lines.push("## Regime Reasoning");
  lines.push(explanation.regime_reasoning);
  lines.push("");
  lines.push("## Signal Weights");
  for (const sw of explanation.signal_weights) {
    lines.push(`- ${sw.signal}: ${(sw.weight * 100).toFixed(0)}% — ${sw.contribution}`);
  }
  if (explanation.weak_points.length > 0) {
    lines.push("");
    lines.push("## Weak Points");
    for (const wp of explanation.weak_points) {
      lines.push(`- ⚠️ ${wp}`);
    }
  }
  if (explanation.thesis_invalidators.length > 0) {
    lines.push("");
    lines.push("## Thesis Invalidators");
    for (const ti of explanation.thesis_invalidators) {
      lines.push(`- 🚫 ${ti}`);
    }
  }
  return lines.join("\n");
}
