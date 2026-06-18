import { describe, it, expect } from "vitest";
import { validateStrategy } from "../lib/validator";
import type { StrategySpec } from "../lib/schemas";

const VALID_TREND_UP: StrategySpec = {
  regime: "TREND_UP",
  directional_bias: "LONG",
  confidence: 0.72,
  setup_name: "Trend Continuation Long",
  indicators_used: ["SMA-20", "SMA-50", "RSI-14"],
  entry_rules: ["Price pulls back to SMA-20 from above", "RSI(14) between 40 and 60"],
  exit_rules: ["RSI(14) exceeds 75", "Price closes below SMA-50"],
  invalidation_rules: ["Price closes below SMA-50 with volume spike"],
  sizing_guidance: "MEDIUM",
  holding_horizon: "SWING",
  do_not_trade_conditions: ["RSI > 80"],
  rationale: "Strong uptrend",
  evidence_summary: ["Momentum positive"],
};

const VAGUE_STRATEGY: StrategySpec = {
  regime: "TREND_UP",
  directional_bias: "LONG",
  confidence: 0.6,
  setup_name: "Vague Setup",
  indicators_used: [],
  entry_rules: ["Buy when it feels right", "Consider selling at your discretion"],
  exit_rules: ["Maybe sell when appropriate"],
  invalidation_rules: [],
  sizing_guidance: "MEDIUM",
  holding_horizon: "SWING",
  do_not_trade_conditions: [],
  rationale: "Vague strategy",
  evidence_summary: [],
};

const CHOP_WITH_TRADE: StrategySpec = {
  regime: "CHOP",
  directional_bias: "LONG",
  confidence: 0.4,
  setup_name: "CHOP Trade",
  indicators_used: [],
  entry_rules: ["rule"],
  exit_rules: ["rule"],
  invalidation_rules: [],
  sizing_guidance: "MEDIUM",
  holding_horizon: "SWING",
  do_not_trade_conditions: [],
  rationale: "test",
  evidence_summary: [],
};

describe("validateStrategy", () => {
  it("passes for a valid strategy", () => {
    const result = validateStrategy(VALID_TREND_UP);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects vague entry rules", () => {
    const result = validateStrategy(VAGUE_STRATEGY);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("vague"))).toBe(true);
  });

  it("flags CHOP with non-zero sizing", () => {
    const result = validateStrategy(CHOP_WITH_TRADE);
    expect(result.issues.some((i) => i.includes("Cannot have non-ZERO sizing in CHOP regime"))).toBe(true);
  });

  it("warns about missing invalidation rules", () => {
    const noInvalidation: StrategySpec = {
      ...VALID_TREND_UP,
      invalidation_rules: [],
    };
    const result = validateStrategy(noInvalidation);
    expect(result.warnings.some((w) => w.includes("invalidation"))).toBe(true);
  });

  it("warns about CHOP with non-NEUTRAL direction", () => {
    const result = validateStrategy(CHOP_WITH_TRADE);
    expect(result.warnings.some((w) => w.includes("NEUTRAL"))).toBe(true);
  });

  it("rejects empty entry rules", () => {
    const noEntry: StrategySpec = {
      ...VALID_TREND_UP,
      entry_rules: [],
    };
    const result = validateStrategy(noEntry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("Entry rules cannot be empty"))).toBe(true);
  });

  it("rejects empty exit rules", () => {
    const noExit: StrategySpec = {
      ...VALID_TREND_UP,
      exit_rules: [],
    };
    const result = validateStrategy(noExit);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("Exit rules cannot be empty"))).toBe(true);
  });
});
