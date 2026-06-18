# CMC Skill Interface

## Overview

The RegimeForge CMC Skill consumes CoinMarketCap Agent Hub data and returns a structured strategy object.

## Input Schema (MarketContext)

```typescript
{
  symbol: string,           // e.g., "BTC"
  name?: string,            // e.g., "Bitcoin"
  price: number,            // Current price in USD
  price_change_24h: number, // 24h percentage change
  price_change_7d?: number, // 7d percentage change
  volume_24h: number,       // 24h trading volume
  volume_change_24h?: number,
  market_cap?: number,
  high_24h?: number,
  low_24h?: number,
  volatility_30d?: number,  // 30-day volatility percentage
  rsi_14?: number,          // 14-period RSI
  macd?: number,
  funding_rate?: number,    // Perpetual futures funding rate
  open_interest_change?: number,
  fear_greed_index?: number, // 0-100
  social_volume_change?: number,
  active_addresses_change?: number,
  exchange_flow_net?: number
}
```

## Output Schema (StrategySpec)

```typescript
{
  regime: "TREND_UP" | "TREND_DOWN" | "MEAN_REVERT_UP" | "MEAN_REVERT_DOWN" | "HIGH_VOL_BREAKOUT" | "CHOP",
  directional_bias: "LONG" | "SHORT" | "NEUTRAL",
  confidence: number,          // 0.0 to 1.0
  setup_name: string,
  indicators_used: string[],
  entry_rules: string[],       // Quantifiable entry conditions
  exit_rules: string[],        // Quantifiable exit conditions
  invalidation_rules: string[],
  sizing_guidance: "ZERO" | "SMALL" | "MEDIUM",
  holding_horizon: "INTRADAY" | "SWING" | "MULTI_DAY",
  do_not_trade_conditions: string[],
  rationale: string,
  evidence_summary: string[]
}
```

## Example Invocation

```typescript
import { runSkill } from "@/lib/runner";
import { DEMO_PRESETS } from "@/lib/cmc-client";

const result = await runSkill(DEMO_PRESETS.BTC, {
  useAI: true,
  runBacktest: true,
  backtestBars: 200
});

console.log(result.strategy.regime);     // "TREND_UP"
console.log(result.strategy.confidence); // 0.72
console.log(result.backtest?.total_return); // 12.5
```

## API Endpoint

```
POST /api/skill
Body: { preset: "BTC", useAI: true, runBacktest: true }
Response: SkillOutput
```
