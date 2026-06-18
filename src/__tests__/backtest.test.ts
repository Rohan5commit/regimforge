import { describe, it, expect } from "vitest";
import { runBacktest } from "@/backtest/engine";
import { generateSyntheticData } from "@/backtest/scenarios";
import type { StrategySpec } from "@/regime/classifiers";

const TREND_UP: StrategySpec = { regime: "TREND_UP", directional_bias: "LONG", confidence: 0.72, setup_name: "T", indicators_used: ["SMA-20","SMA-50","RSI-14"], entry_rules: ["Pullback to SMA-20"], exit_rules: ["RSI > 75"], invalidation_rules: ["Below SMA-50"], sizing_guidance: "MEDIUM", holding_horizon: "SWING", do_not_trade_conditions: [], rationale: "t", evidence_summary: [] };
const CHOP: StrategySpec = { regime: "CHOP", directional_bias: "NEUTRAL", confidence: 0.3, setup_name: "NT", indicators_used: [], entry_rules: ["No entry"], exit_rules: ["No exit"], invalidation_rules: [], sizing_guidance: "ZERO", holding_horizon: "INTRADAY", do_not_trade_conditions: ["Chop"], rationale: "no", evidence_summary: [] };

describe("generateSyntheticData", () => {
  it("correct bar count", () => { expect(generateSyntheticData("TREND_UP", 100)).toHaveLength(100); });
  it("valid OHLCV", () => { for (const b of generateSyntheticData("TREND_UP", 50)) { expect(b.high).toBeGreaterThanOrEqual(b.low); expect(b.volume).toBeGreaterThan(0); } });
});

describe("runBacktest", () => {
  it("insufficient data", () => { const r = runBacktest(TREND_UP, generateSyntheticData("TREND_UP", 10)); expect(r.trade_count).toBe(0); expect(r.summary).toContain("Insufficient"); });
  it("produces equity curve", () => { expect(runBacktest(TREND_UP, generateSyntheticData("TREND_UP", 200)).equity_curve.length).toBeGreaterThan(0); });
  it("CHOP no trades", () => { expect(runBacktest(CHOP, generateSyntheticData("CHOP", 200)).trade_count).toBe(0); });
  it("drawdown in [0,100]", () => { const r = runBacktest(TREND_UP, generateSyntheticData("TREND_UP", 200)); expect(r.max_drawdown).toBeGreaterThanOrEqual(0); expect(r.max_drawdown).toBeLessThanOrEqual(100); });
  it("win rate in [0,100]", () => { const r = runBacktest(TREND_UP, generateSyntheticData("TREND_UP", 200)); expect(r.win_rate).toBeGreaterThanOrEqual(0); expect(r.win_rate).toBeLessThanOrEqual(100); });

  it("TREND_UP produces non-catastrophic return (regression: principal bug)", () => {
    const r = runBacktest(TREND_UP, generateSyntheticData("TREND_UP", 200));
    expect(r.total_return).toBeGreaterThan(-50);
    expect(r.trade_count).toBeGreaterThan(0);
  });
  it("total return is finite", () => { expect(Number.isFinite(runBacktest(TREND_UP, generateSyntheticData("TREND_UP", 200)).total_return)).toBe(true); });
});