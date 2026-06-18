import type { StrategySpec } from "@/regime/classifiers";
import { nimChatJSON } from "@/ai/nim-client";
import { buildCritiqueMessages } from "@/skill/prompts";
import { StrategySpecSchema } from "@/regime/classifiers";

export async function runCritiqueLoop(strategy: StrategySpec, useAI: boolean): Promise<StrategySpec> {
  if (!useAI) return strategy;
  try {
    const messages = buildCritiqueMessages(JSON.stringify(strategy, null, 2));
    const result = await nimChatJSON(messages, StrategySpecSchema, { temperature: 0.2 });
    return result;
  } catch { return strategy; }
}