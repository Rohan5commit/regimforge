# Demo Script (2-3 minutes)

## Opening (30s)

"RegimeForge is a CoinMarketCap-native AI strategy skill for BNB Hack Track 2. It reads market data from CMC Agent Hub, classifies the market regime, and generates a structured, backtestable trading strategy — complete with explainability and backtest results."

## Demo Walkthrough (90s)

1. **Select Asset**: "Let's run it on Bitcoin." Click BTC preset.

2. **Run Skill**: "One click — the skill ingests market data, computes signals, and sends everything to NVIDIA NIM for regime classification and strategy generation."

3. **Regime Result**: "RegimeForge classified this as TREND_UP with 72% confidence. The momentum signal scored highest at 35%, followed by sentiment at 25%."

4. **Strategy Output**: "It generated a Trend Continuation Long setup with specific entry rules — pullback to SMA-20, RSI between 40-60, price above SMA-50. Exit rules include RSI > 75 and trailing stops. This isn't vague prose — it's backtestable."

5. **Explainability**: "The explainability panel shows signal weights, weak points (momentum-sentiment divergence flagged as a risk), and thesis invalidators. A trader can inspect and trust this output."

6. **Backtest**: "The backtest ran over 200 synthetic bars matching the TREND_UP regime. Positive return, controlled drawdown, 65% win rate. The equity curve shows consistent performance."

## Architecture (30s)

"The architecture is modular — schemas validated with zod, deterministic signal computation before AI inference, a critique loop to catch weak strategies, and a fallback path when AI is unavailable. This is not a prompt wrapper."

## Close (15s)

"RegimeForge converts noisy market data into useful, explainable, backtestable strategy objects. It's a reusable strategy brain for traders and agents — not an execution stack, not a chatbot. That's the edge for Track 2."
