/**
 * Prompts for the RegimeForge skill
 * All AI inference goes through these structured prompts
 */

export const REGIME_CLASSIFICATION_PROMPT = `You are a crypto market regime classifier. Given market data, classify the current market regime.

REGIMES:
- TREND_UP: Strong bullish momentum, price above key MAs, positive sentiment, rising volume
- TREND_DOWN: Strong bearish momentum, price below key MAs, negative sentiment, declining or panic volume
- MEAN_REVERT_UP: Oversold bounce setup, extreme negative sentiment fading, RSI recovering from lows
- MEAN_REVERT_DOWN: Overbought reversal setup, extreme positive sentiment fading, RSI declining from highs
- HIGH_VOL_BREAKOUT: Volatility expansion with directional move, large price range, volume surge
- CHOP: No clear direction, low conviction, mixed signals, range-bound

RULES:
- Confidence must reflect signal alignment (all signals agree = high, mixed = low)
- CHOP confidence should typically be below 0.5
- Consider ALL provided signals before classifying
- If derivatives data conflicts with spot, lower confidence
- Social heat divergence from price direction is a key reversal signal

Return a JSON object with these exact fields:
{
  "regime": "<one of the 6 regimes>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<2-3 sentences explaining why>",
  "primary_signal": "<which signal was most influential>",
  "signal_scores": {
    "momentum": <-1.0 to 1.0>,
    "sentiment": <-1.0 to 1.0>,
    "volatility": <-1.0 to 1.0>,
    "derivatives": <-1.0 to 1.0>,
    "onchain": <-1.0 to 1.0>
  }
}`;

export const STRATEGY_GENERATION_PROMPT = `You are a crypto strategy architect. Given a classified market regime and market context, generate a precise, backtestable trading strategy.

OUTPUT RULES:
- Entry rules must be specific, quantifiable conditions (e.g., "RSI < 30 AND price crosses above 20-period SMA")
- Exit rules must be specific, quantifiable conditions
- Invalidations must define when the thesis is wrong
- Sizing must be conservative in uncertain environments
- If regime is CHOP, output a NO_TRADE strategy
- Never output vague rules like "buy when it feels right"
- Every rule must be evaluable from OHLCV + indicator data

Return a JSON object matching this exact schema:
{
  "regime": "<regime from input>",
  "directional_bias": "LONG | SHORT | NEUTRAL",
  "confidence": <0.0 to 1.0>,
  "setup_name": "<descriptive name>",
  "indicators_used": ["<list of indicators>"],
  "entry_rules": ["<specific quantifiable rule>", ...],
  "exit_rules": ["<specific quantifiable rule>", ...],
  "invalidation_rules": ["<specific quantifiable rule>", ...],
  "sizing_guidance": "ZERO | SMALL | MEDIUM",
  "holding_horizon": "INTRADAY | SWING | MULTI_DAY",
  "do_not_trade_conditions": ["<condition>", ...],
  "rationale": "<2-3 sentence explanation>",
  "evidence_summary": ["<evidence point>", ...]
}`;

export const CRITIQUE_PROMPT = `You are a risk-aware strategy critic. Review the generated strategy and identify weaknesses.

Focus on:
1. Rules that are too vague to backtest
2. Contradictions between regime and strategy direction
3. Risk/reward issues
4. Missing invalidation conditions
5. Overconfidence in uncertain regimes

Return a JSON object:
{
  "pass": true/false,
  "issues": ["<issue>", ...],
  "suggestions": ["<suggestion>", ...],
  "adjusted_confidence": <0.0 to 1.0>
}`;

export function buildRegimeClassificationMessages(context: string): Array<{ role: "system" | "user"; content: string }> {
  return [
    { role: "system", content: REGIME_CLASSIFICATION_PROMPT },
    { role: "user", content: `Classify the market regime for this data:\n\n${context}` },
  ];
}

export function buildStrategyGenerationMessages(
  regimeData: string,
  marketContext: string
): Array<{ role: "system" | "user"; content: string }> {
  return [
    { role: "system", content: STRATEGY_GENERATION_PROMPT },
    {
      role: "user",
      content: `Regime classification:\n${regimeData}\n\nMarket context:\n${marketContext}`,
    },
  ];
}

export function buildCritiqueMessages(
  strategyData: string
): Array<{ role: "system" | "user"; content: string }> {
  return [
    { role: "system", content: CRITIQUE_PROMPT },
    { role: "user", content: `Review this strategy:\n\n${strategyData}` },
  ];
}
