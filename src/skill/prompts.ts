export const REGIME_CLASSIFICATION_PROMPT = `You are a crypto market regime classifier. Given market data, classify the current market regime.
REGIMES:
- TREND_UP: Strong bullish momentum, price above key MAs, positive sentiment, rising volume
- TREND_DOWN: Strong bearish momentum, price below key MAs, negative sentiment
- MEAN_REVERT_UP: Oversold bounce setup, extreme negative sentiment fading, RSI recovering
- MEAN_REVERT_DOWN: Overbought reversal setup, extreme positive sentiment fading
- HIGH_VOL_BREAKOUT: Volatility expansion with directional move, large price range
- CHOP: No clear direction, low conviction, mixed signals, range-bound
RULES:
- Confidence must reflect signal alignment
- CHOP confidence typically below 0.5
- Consider ALL provided signals before classifying
Return a JSON object with: regime, confidence, reasoning, primary_signal, signal_scores {momentum, sentiment, volatility, derivatives, onchain}`;

export const STRATEGY_GENERATION_PROMPT = `You are a crypto strategy architect. Given a classified market regime and market context, generate a precise, backtestable trading strategy.
OUTPUT RULES:
- Entry rules must be specific, quantifiable conditions
- Exit rules must be specific, quantifiable conditions
- Invalidations must define when the thesis is wrong
- Sizing must be conservative in uncertain environments
- If regime is CHOP, output a NO_TRADE strategy
Return a JSON matching: regime, directional_bias, confidence, setup_name, indicators_used, entry_rules, exit_rules, invalidation_rules, sizing_guidance, holding_horizon, do_not_trade_conditions, rationale, evidence_summary`;

export const CRITIQUE_PROMPT = `You are a risk-aware strategy critic. Review the generated strategy and identify weaknesses.
Return a JSON with: pass (bool), issues, suggestions, adjusted_confidence`;

export function buildRegimeClassificationMessages(context: string) {
  return [{ role: "system" as const, content: REGIME_CLASSIFICATION_PROMPT }, { role: "user" as const, content: `Classify the market regime for this data:

${context}` }];
}
export function buildStrategyGenerationMessages(regimeData: string, marketContext: string) {
  return [{ role: "system" as const, content: STRATEGY_GENERATION_PROMPT }, { role: "user" as const, content: `Regime classification:
${regimeData}

Market context:
${marketContext}` }];
}
export function buildCritiqueMessages(strategyData: string) {
  return [{ role: "system" as const, content: CRITIQUE_PROMPT }, { role: "user" as const, content: `Review this strategy:

${strategyData}` }];
}