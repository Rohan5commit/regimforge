import { describe, it, expect } from "vitest";
import { StrategySpecSchema, MarketContextSchema, BacktestResultSchema } from "@/regime/classifiers";

describe("StrategySpecSchema", () => {
  it("validates correct spec", () => { expect(() => StrategySpecSchema.parse({ regime: "TREND_UP", directional_bias: "LONG", confidence: 0.75, setup_name: "T", indicators_used: [], entry_rules: ["r"], exit_rules: ["r"], invalidation_rules: [], sizing_guidance: "MEDIUM", holding_horizon: "SWING", do_not_trade_conditions: [], rationale: "t", evidence_summary: [] })).not.toThrow(); });
  it("rejects invalid regime", () => { expect(() => StrategySpecSchema.parse({ regime: "X", directional_bias: "LONG", confidence: 0.5, setup_name: "T", indicators_used: [], entry_rules: ["r"], exit_rules: ["r"], invalidation_rules: [], sizing_guidance: "SMALL", holding_horizon: "SWING", do_not_trade_conditions: [], rationale: "t", evidence_summary: [] })).toThrow(); });
  it("rejects confidence > 1", () => { expect(() => StrategySpecSchema.parse({ regime: "CHOP", directional_bias: "NEUTRAL", confidence: 1.5, setup_name: "T", indicators_used: [], entry_rules: ["r"], exit_rules: ["r"], invalidation_rules: [], sizing_guidance: "ZERO", holding_horizon: "INTRADAY", do_not_trade_conditions: [], rationale: "t", evidence_summary: [] })).toThrow(); });
  it("accepts all regimes", () => { for (const r of ["TREND_UP","TREND_DOWN","MEAN_REVERT_UP","MEAN_REVERT_DOWN","HIGH_VOL_BREAKOUT","CHOP"]) { expect(() => StrategySpecSchema.parse({ regime: r, directional_bias: "NEUTRAL", confidence: 0.5, setup_name: "T", indicators_used: [], entry_rules: ["r"], exit_rules: ["r"], invalidation_rules: [], sizing_guidance: "ZERO", holding_horizon: "INTRADAY", do_not_trade_conditions: [], rationale: "t", evidence_summary: [] })).not.toThrow(); } });
});

describe("MarketContextSchema", () => {
  it("validates correct context", () => { expect(() => MarketContextSchema.parse({ symbol: "BTC", price: 100000, price_change_24h: 3.5, volume_24h: 42e9 })).not.toThrow(); });
  it("requires symbol and price", () => { expect(() => MarketContextSchema.parse({})).toThrow(); });
});

describe("BacktestResultSchema", () => {
  it("validates result", () => { expect(() => BacktestResultSchema.parse({ total_return: 12.5, max_drawdown: 5.2, trade_count: 8, win_rate: 62.5, avg_holding_period: "12 bars", summary: "Good", equity_curve: [10000, 10200], trades: [{ entry_price: 100, exit_price: 105, direction: "LONG", return_pct: 5, holding_bars: 10 }] })).not.toThrow(); });
});