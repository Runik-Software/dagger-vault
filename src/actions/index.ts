"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { campaign, character, userCampaign } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Character, EditCharacter } from "@/schema";

const getCurrentUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
};

export const createCampaign = async (name: string, description?: string) => {
  const userId = await getCurrentUserId();
  const [created] = await db
    .insert(campaign)
    .values({ name, description })
    .returning();
  await db.insert(userCampaign).values({ userId, campaignId: created.id });
  return created;
};

export const getCharacters = async (): Promise<Character[]> => {
  const userId = await getCurrentUserId();
  return db.select().from(character).where(eq(character.userId, userId));
};

export const createCharacter = async (
  data: EditCharacter,
): Promise<Character> => {
  const userId = await getCurrentUserId();
  const [created] = await db
    .insert(character)
    .values({ ...data, userId })
    .returning();
  return created;
};

export const updateCharacter = async (id: string, data: Partial<Character>) => {
  const [updated] = await db
    .update(character)
    .set(data)
    .where(eq(character.id, id))
    .returning();
  return updated;
};

export const deleteCharacter = async (id: string) => {
  await db.delete(character).where(eq(character.id, id));
};
