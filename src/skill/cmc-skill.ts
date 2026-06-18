import type { MarketContext, SkillOutput } from "@/regime/classifiers";
import { runSkill, type RunOptions } from "@/orchestration/runner";
export type { RunOptions } from "@/orchestration/runner";
/** RegimeForge CMC Skill - Consumes CMC Agent Hub data and returns structured strategy object */
export async function regimeForgeSkill(context: MarketContext, options?: RunOptions): Promise<SkillOutput> {
  return runSkill(context, options);
}