import z from "zod";
import type { campaign, character } from "@/db/schema";

const resourceSchema = z.object({
  current: z.number().min(0),
  max: z.number().min(1),
});

const goldSchema = z.object({
  handfuls: z.number().min(0),
  bags: z.number().min(0),
  chests: z.number().min(0),
});

export const editCharacterSchema = z.object({
  portraitUrl: z.string().nullish(),
  name: z.string().min(1, "Name is required"),
  notes: z.string().nullish(),
  hitpoints: resourceSchema,
  hope: resourceSchema,
  stress: resourceSchema,
  armourSlots: resourceSchema,
  gold: goldSchema,
});

export type Character = typeof character.$inferSelect;
export type EditCharacter = z.infer<typeof editCharacterSchema>;
export type Campaign = typeof campaign.$inferSelect;

export type DualityDiceRoll = {
  user: string;
  character?: Character | null;
  hopeDie: number;
  fearDie: number;
  rollType: "hope" | "fear" | "critical";
  timestamp: string;
};

export const DICE_VALUES = [4, 6, 8, 10, 12, 20] as const;
export type DiceValue = (typeof DICE_VALUES)[number];


export type PoolDiceRoll = {
  user: string;
  character?: Character | null;
  results: DiceRollResult;
  total: number;
  rollType: "pool";
  timestamp: string;
};

export type AnyDiceRoll = DualityDiceRoll | PoolDiceRoll;

export function isDualityDiceRoll(roll: AnyDiceRoll): roll is DualityDiceRoll {
  return (roll as DualityDiceRoll).hopeDie !== undefined;
}

export function isPoolDiceRoll(roll: AnyDiceRoll): roll is PoolDiceRoll {
  return (roll as PoolDiceRoll).rollType === "pool";
}


export interface IndividualRoll {
  die: number;
  order: number;
  roll: number;
  type: "roll";
  value: number;
}

interface Modifier {
  type: "number";
  value: number;
  rolls?: never; // Ensures we can distinguish from IndividualRoll
}

type DiceElement = IndividualRoll | Modifier;

export interface DiceBoxGroupResult {
  count: { value: number };
  die: { value: number };
  rolls: DiceElement[];
  type: "die";
  value: number; // The sum of the rolls
}

export interface MultiDiceRollResult {
  dice: DiceBoxGroupResult[];
  value: number; // The total sum of all dice
  ops: string[];
  type: "expressionroll";
}

export type DiceRollResult = DiceBoxGroupResult | MultiDiceRollResult;

export function isMultiDiceRollResult(
  result: DiceRollResult,
): result is MultiDiceRollResult {
  return result.type === "expressionroll";
}

export function isSimpleDieRollResult(
  result: DiceRollResult,
): result is DiceBoxGroupResult {
  return result.type === "die";
}