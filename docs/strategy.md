# Strategy Methodology

## Regime Classification

### TREND_UP
Strong bullish momentum with price above key moving averages, positive sentiment, and rising volume. Strategy: continuation/breakout long with pullback entries.

### TREND_DOWN
Strong bearish momentum with price below key moving averages, negative sentiment, and panic or declining volume. Strategy: continuation short with bounce entries.

### MEAN_REVERT_UP
Oversold conditions with extreme negative sentiment fading, RSI recovering from lows. Strategy: buy the bounce with tight stops.

### MEAN_REVERT_DOWN
Overbought conditions with extreme positive sentiment fading, RSI declining from highs. Strategy: fade the rally with tight stops.

### HIGH_VOL_BREAKOUT
Volatility expansion with directional move, large price range, and volume surge. Strategy: breakout entries with volatility-based stops.

### CHOP
No clear direction, low conviction, mixed signals, range-bound. Strategy: no trade. The correct action is to stay flat.

## Signal Interpretation

| Signal | Source | Bullish Range | Bearish Range |
|--------|--------|---------------|---------------|
| Momentum | RSI, price changes, MA crossovers | +0.2 to +1.0 | -0.2 to -1.0 |
| Sentiment | Fear/Greed index, social volume | +0.2 to +1.0 | -0.2 to -1.0 |
| Volatility | ATR, price range | High = breakout risk | Low = trend continuation |
| Derivatives | Funding rate, OI change | Positive funding = long crowding | Negative = short crowding |
| On-chain | Exchange flows, active addresses | Net outflows = bullish | Net inflows = bearish |

## Trade/No-Trade Philosophy

- Only trade when regime confidence exceeds threshold
- CHOP regime = always NO_TRADE
- High volatility with low confidence = NO_TRADE
- Conflicting signals = reduce sizing or NO_TRADE

## Sizing Logic

- MEDIUM: High confidence (≥0.6), aligned signals, clear regime
- SMALL: Moderate confidence (0.3-0.6), mostly aligned signals
- ZERO: Low confidence (<0.3), CHOP regime, conflicting signals

## Invalidation Logic

Every strategy must have thesis invalidators:
- Trend reversal signals (price crossing key MAs)
- Regime shift (e.g., TREND_UP → CHOP)
- Indicator extremes (RSI reaching opposite extreme)
- Volume divergence from price direction
