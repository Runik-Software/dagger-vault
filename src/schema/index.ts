import z from "zod";

const resourceSchema = z.object({
  current: z.number().min(0),
  max: z.number().min(1),
});

const goldSchema = z.object({
  handfuls: z.number().min(0),
  bags: z.number().min(0),
  chests: z.number().min(0),
});

export const characterSchema = z.object({
  id: z.string(),
  portraitUrl: z.url().optional(),
  name: z.string().min(1, "Name is required"),
  notes: z.string().optional(),
  hitpoints: resourceSchema,
  hope: resourceSchema,
  stress: resourceSchema,
  armourSlots: resourceSchema,
  gold: goldSchema
});

export type Character = z.infer<typeof characterSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type Gold = z.infer<typeof goldSchema>;