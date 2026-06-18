# Prompts Used

## Regime Classification Prompt

Classifies market data into one of 6 regimes. Uses system prompt with explicit regime definitions and scoring rules. Returns JSON with regime, confidence, reasoning, primary_signal, and signal_scores.

Key rules:
- CHOP confidence typically below 0.5
- Social heat divergence from price is a key reversal signal
- Derivatives-spot conflict reduces confidence

## Strategy Generation Prompt

Takes regime classification and market context, generates structured strategy spec. Enforces quantifiable rules only — vague rules like "buy when it feels right" are rejected by the system.

Key rules:
- Entry/exit rules must be evaluable from OHLCV + indicators
- CHOP regime must output NO_TRADE
- Sizing conservative in uncertain environments

## Critique Prompt

Reviews generated strategy for weaknesses. Checks for:
- Rules too vague to backtest
- Regime/direction contradictions
- Risk/reward issues
- Missing invalidations
- Overconfidence

Returns pass/fail with adjustment suggestions.

## Design Principles

All prompts follow these principles:
- Structured JSON output (no free text)
- Schema-validated with zod
- Retry on malformed output with reduced temperature
- Compact, low-verbosity for speed
- No fabrication of unsupported data
