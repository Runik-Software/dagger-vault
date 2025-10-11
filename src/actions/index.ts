"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { campaign, character, userCampaign } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Character, EditCharacter } from "@/schema";
import { pusher } from "@/lib/pusher";

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

export const getCampaigns = async () => {
  const userId = await getCurrentUserId();
  return db.query.campaign.findMany({
    where: {
      OR: [{ ownerUserId: userId }, { users: { id: userId } }],
    },
  });
};

export const getCampaign = async (id: string) => {
  const userId = await getCurrentUserId();
  return db.query.campaign.findFirst({
    where: {
      OR: [{ ownerUserId: userId }, { users: { id: userId } }],
      id,
    },
  });
};

export const getCharacters = async (
  campaignId: string,
): Promise<Character[]> => {
  return db.query.character.findMany({
    where: {
      campaignId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const createCharacter = async (
  campaignId: string,
  data: EditCharacter,
): Promise<Character> => {
  const userId = await getCurrentUserId();
  const [created] = await db
    .insert(character)
    .values({ ...data, userId, campaignId })
    .returning();
  return created;
};

export const updateCharacter = async (id: string, data: Partial<Character>) => {
  const [updated] = await db
    .update(character)
    .set(data)
    .where(eq(character.id, id))
    .returning();
  console.log("Triggering character-updated event for id:", updated.id);
  pusher.trigger(
    `private-campaign-${updated.campaignId}-characters`,
    "update",
    {
      character: updated,
    },
  );
  return updated;
};

export const deleteCharacter = async (id: string) => {
  await db.delete(character).where(eq(character.id, id));
};
