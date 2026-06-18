import { RegimeClassificationSchema } from "@/regime/classifier";
import { StrategySpecSchema } from "@/regime/classifiers";
export { RegimeClassificationSchema, StrategySpecSchema };
export const CritiqueOutputSchema = StrategySpecSchema;
export type CritiqueOutput = typeof CritiqueOutputSchema._type;