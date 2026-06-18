import { describe, it, expect } from "vitest";
import { validateStrategy } from "@/regime/validators";
import type { StrategySpec } from "@/regime/classifiers";

const VALID: StrategySpec = { regime: "TREND_UP", directional_bias: "LONG", confidence: 0.72, setup_name: "T", indicators_used: ["SMA-20"], entry_rules: ["Price pulls back to SMA-20"], exit_rules: ["RSI > 75"], invalidation_rules: ["Price below SMA-50"], sizing_guidance: "MEDIUM", holding_horizon: "SWING", do_not_trade_conditions: ["RSI > 80"], rationale: "test", evidence_summary: [] };
const VAGUE: StrategySpec = { regime: "TREND_UP", directional_bias: "LONG", confidence: 0.6, setup_name: "V", indicators_used: [], entry_rules: ["Buy when it feels right"], exit_rules: ["Maybe sell"], invalidation_rules: [], sizing_guidance: "MEDIUM", holding_horizon: "SWING", do_not_trade_conditions: [], rationale: "v", evidence_summary: [] };
const CHOP_TRADE: StrategySpec = { regime: "CHOP", directional_bias: "LONG", confidence: 0.4, setup_name: "C", indicators_used: [], entry_rules: ["r"], exit_rules: ["r"], invalidation_rules: [], sizing_guidance: "MEDIUM", holding_horizon: "SWING", do_not_trade_conditions: [], rationale: "t", evidence_summary: [] };

describe("validateStrategy", () => {
  it("passes valid", () => { const r = validateStrategy(VALID); expect(r.valid).toBe(true); expect(r.issues).toHaveLength(0); });
  it("rejects vague rules", () => { expect(validateStrategy(VAGUE).valid).toBe(false); expect(validateStrategy(VAGUE).issues.some(i => i.includes("vague"))).toBe(true); });
  it("flags CHOP with non-zero sizing", () => { expect(validateStrategy(CHOP_TRADE).issues.some(i => i.includes("Cannot have non-ZERO sizing"))).toBe(true); });
  it("warns missing invalidation", () => { expect(validateStrategy({ ...VALID, invalidation_rules: [] }).warnings.some(w => w.includes("invalidation"))).toBe(true); });
  it("rejects empty entry rules", () => { expect(validateStrategy({ ...VALID, entry_rules: [] }).valid).toBe(false); });
  it("rejects empty exit rules", () => { expect(validateStrategy({ ...VALID, exit_rules: [] }).valid).toBe(false); });
  it("warns CHOP with non-NEUTRAL", () => { expect(validateStrategy(CHOP_TRADE).warnings.some(w => w.includes("NEUTRAL"))).toBe(true); });
});