import z from "zod";
import type { character } from "@/db/schema";

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

export type DiceRoll = {
  character?: Character | null;
  hopeDie: number;
  fearDie: number;
};
