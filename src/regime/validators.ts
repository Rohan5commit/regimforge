/**
 * Deterministic Rule Validator
 * Validates that strategy specs have actionable, quantifiable rules
 */
import type { StrategySpec } from "@/regime/classifiers";

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

const VAGUE_PATTERNS = [
  /when it feels/i,
  /when appropriate/i,
  /at your discretion/i,
  /consider selling/i,
  /maybe/i,
  /possibly/i,
  /look at/i,
  /watch for/i,
  /good entry/i,
  /bad entry/i,
  /when ready/i,
];

const QUANTIFIABLE_PATTERNS = [
  /rsi\s*[<>=!]+\s*\d+/i,
  /macd/i,
  /sma|ema|moving average/i,
  /price\s*[<>=!]+/i,
  /volume\s*[<>=!]+/i,
  /bollinger/i,
  /atr\s*[<>=!]+/i,
  /\d+\s*%/i,
  /cross(es|ing)?\s*(above|below)/i,
  /drawdown/i,
  /stop\s*loss/i,
  /take\s*profit/i,
  /consecutive/i,
];

/**
 * Validate a strategy spec for backtestability
 */
export function validateStrategy(spec: StrategySpec): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Validate entry rules
  if (spec.entry_rules.length === 0) {
    issues.push("Entry rules cannot be empty");
  }
  for (const rule of spec.entry_rules) {
    if (isVague(rule)) {
      issues.push(`Entry rule is too vague to backtest: "${rule}"`);
    }
  }

  // Validate exit rules
  if (spec.exit_rules.length === 0) {
    issues.push("Exit rules cannot be empty");
  }
  for (const rule of spec.exit_rules) {
    if (isVague(rule)) {
      issues.push(`Exit rule is too vague to backtest: "${rule}"`);
    }
  }

  // Validate invalidation rules
  if (spec.invalidation_rules.length === 0) {
    warnings.push("No invalidation rules defined — consider adding thesis invalidators");
  }

  // Validate regime/direction consistency
  if (spec.regime === "CHOP" && spec.sizing_guidance !== "ZERO") {
    issues.push("Cannot have non-ZERO sizing in CHOP regime — no trade is the correct action");
  }
  if (spec.regime === "CHOP" && spec.directional_bias !== "NEUTRAL") {
    warnings.push("CHOP regime should have NEUTRAL directional bias");
  }

  // Confidence checks
  if (spec.confidence > 0.8 && spec.sizing_guidance === "ZERO") {
    warnings.push("High confidence but ZERO sizing — verify this is intentional");
  }
  if (spec.confidence < 0.3 && spec.sizing_guidance === "MEDIUM") {
    issues.push("Cannot have MEDIUM sizing with confidence below 0.3");
  }

  // Do-not-trade conditions
  if (spec.do_not_trade_conditions.length === 0) {
    warnings.push("No do_not_trade_conditions defined");
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
}

function isVague(rule: string): boolean {
  return VAGUE_PATTERNS.some((p) => p.test(rule));
}

function isQuantifiable(rule: string): boolean {
  return QUANTIFIABLE_PATTERNS.some((p) => p.test(rule));
}
