import type { StrategySpec } from "@/regime/classifiers";
import { nimChatJSON } from "@/ai/nim-client";
import { buildCritiqueMessages, buildStrategyGenerationMessages } from "@/skill/prompts";
import { z } from "zod";
import { StrategySpecSchema } from "@/regime/classifiers";

/** Schema for the critique LLM response — matches CRITIQUE_PROMPT output */
const CritiqueSchema = z.object({
  pass: z.boolean(),
  issues: z.array(z.string()),
  suggestions: z.array(z.string()),
  adjusted_confidence: z.number().min(0).max(1),
});

type CritiqueResult = z.infer<typeof CritiqueSchema>;

/**
 * Two-phase critique loop:
 *  1. Critique the strategy → get pass/fail + issues
 *  2. If !pass, regenerate strategy with issues injected as constraints
 */
export async function runCritiqueLoop(strategy: StrategySpec, useAI: boolean): Promise<StrategySpec> {
  if (!useAI) return strategy;

  try {
    // Phase 1: Get critique
    const critiqueMessages = buildCritiqueMessages(JSON.stringify(strategy, null, 2));
    const critique: CritiqueResult = await nimChatJSON(critiqueMessages, CritiqueSchema, { temperature: 0.2 });

    // If critique passes, just adjust confidence and return
    if (critique.pass) {
      return { ...strategy, confidence: critique.adjusted_confidence };
    }

    // Phase 2: Regenerate strategy with issues injected as constraints
    const issueList = [
      ...critique.issues.map(i => `ISSUE: ${i}`),
      ...critique.suggestions.map(s => `SUGGESTION: ${s}`),
    ].join("\n");

    const contextWithFeedback = [
      `Original strategy:`,
      JSON.stringify(strategy, null, 2),
      ``,
      `Critique feedback (address ALL of these):`,
      issueList,
      ``,
      `Regenerate the strategy fixing the issues above. Keep the same regime and signal data.`,
    ].join("\n");

    const strategyMessages = buildStrategyGenerationMessages(strategy.regime, contextWithFeedback);
    const improved = await nimChatJSON(strategyMessages, StrategySpecSchema, { temperature: 0.3 });

    return improved;
  } catch {
    return strategy;
  }
}
