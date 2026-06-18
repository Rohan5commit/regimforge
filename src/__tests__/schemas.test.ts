import { describe, it, expect } from "vitest";
import {
  StrategySpecSchema,
  MarketContextSchema,
  BacktestResultSchema,
  SkillOutputSchema,
} from "../lib/schemas";

describe("StrategySpecSchema", () => {
  it("validates a correct strategy spec", () => {
    const spec = {
      regime: "TREND_UP",
      directional_bias: "LONG",
      confidence: 0.75,
      setup_name: "Trend Continuation Long",
      indicators_used: ["SMA-20", "RSI-14"],
      entry_rules: ["Price pulls back to SMA-20", "RSI between 40-60"],
      exit_rules: ["RSI > 75", "Price closes below SMA-50"],
      invalidation_rules: ["Price closes below SMA-50 with volume"],
      sizing_guidance: "MEDIUM",
      holding_horizon: "SWING",
      do_not_trade_conditions: ["RSI > 80"],
      rationale: "Strong uptrend with pullback opportunity",
      evidence_summary: ["Momentum positive", "Sentiment aligned"],
    };
    expect(() => StrategySpecSchema.parse(spec)).not.toThrow();
  });

  it("rejects invalid regime", () => {
    const spec = {
      regime: "INVALID_REGIME",
      directional_bias: "LONG",
      confidence: 0.5,
      setup_name: "Test",
      indicators_used: [],
      entry_rules: ["rule"],
      exit_rules: ["rule"],
      invalidation_rules: [],
      sizing_guidance: "SMALL",
      holding_horizon: "SWING",
      do_not_trade_conditions: [],
      rationale: "test",
      evidence_summary: [],
    };
    expect(() => StrategySpecSchema.parse(spec)).toThrow();
  });

  it("rejects confidence out of range", () => {
    const spec = {
      regime: "CHOP",
      directional_bias: "NEUTRAL",
      confidence: 1.5,
      setup_name: "Test",
      indicators_used: [],
      entry_rules: ["rule"],
      exit_rules: ["rule"],
      invalidation_rules: [],
      sizing_guidance: "ZERO",
      holding_horizon: "INTRADAY",
      do_not_trade_conditions: [],
      rationale: "test",
      evidence_summary: [],
    };
    expect(() => StrategySpecSchema.parse(spec)).toThrow();
  });

  it("accepts all valid regimes", () => {
    const regimes = [
      "TREND_UP",
      "TREND_DOWN",
      "MEAN_REVERT_UP",
      "MEAN_REVERT_DOWN",
      "HIGH_VOL_BREAKOUT",
      "CHOP",
    ];
    for (const regime of regimes) {
      const spec = {
        regime,
        directional_bias: "NEUTRAL",
        confidence: 0.5,
        setup_name: "Test",
        indicators_used: [],
        entry_rules: ["rule"],
        exit_rules: ["rule"],
        invalidation_rules: [],
        sizing_guidance: "ZERO",
        holding_horizon: "INTRADAY",
        do_not_trade_conditions: [],
        rationale: "test",
        evidence_summary: [],
      };
      expect(() => StrategySpecSchema.parse(spec)).not.toThrow();
    }
  });
});

describe("MarketContextSchema", () => {
  it("validates a correct market context", () => {
    const ctx = {
      symbol: "BTC",
      price: 100000,
      price_change_24h: 3.5,
      volume_24h: 42_000_000_000,
    };
    expect(() => MarketContextSchema.parse(ctx)).not.toThrow();
  });

  it("requires symbol and price", () => {
    expect(() => MarketContextSchema.parse({})).toThrow();
  });

  it("accepts minimal valid context", () => {
    const ctx = {
      symbol: "ETH",
      price: 3500,
      price_change_24h: -1.2,
      volume_24h: 20_000_000_000,
    };
    expect(() => MarketContextSchema.parse(ctx)).not.toThrow();
  });
});

describe("BacktestResultSchema", () => {
  it("validates a correct backtest result", () => {
    const result = {
      total_return: 12.5,
      max_drawdown: 5.2,
      trade_count: 8,
      win_rate: 62.5,
      avg_holding_period: "12 bars",
      summary: "Good performance",
      equity_curve: [10000, 10200, 10500],
      trades: [
        {
          entry_price: 100,
          exit_price: 105,
          direction: "LONG",
          return_pct: 5.0,
          holding_bars: 10,
        },
      ],
    };
    expect(() => BacktestResultSchema.parse(result)).not.toThrow();
  });
});
