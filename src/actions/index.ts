"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { campaign, character, userCampaign } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusher } from "@/lib/pusher";
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
    .values({ name, description, ownerUserId: userId })
    .returning();
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

export const getCampaignUsers = async (id: string) => {
  const userId = await getCurrentUserId();
  const userOwnsCampaign = await db.query.campaign.findFirst({
    where: { id, ownerUserId: userId },
  });
  if (!userOwnsCampaign) {
    throw new Error(`Current user does not own campaign with ID ${id}`);
  }
  return db.query.user.findMany({
    where: {
      campaigns: { id },
    },
  });
};

export const doesUserOwnCampaign = async (campaignId: string) => {
  const userId = await getCurrentUserId();
  const userOwnsCampaign = await db.query.campaign.findFirst({
    where: { id: campaignId, ownerUserId: userId },
  });
  return Boolean(userOwnsCampaign);
};

export const canUserViewCampaign = async (
  campaignId: string,
  userId: string,
) => {
  const campaign = await db.query.campaign.findFirst({
    where: {
      id: campaignId,
      OR: [{ ownerUserId: userId }, { users: { id: userId } }],
    },
  });
  return Boolean(campaign);
};

export const addUserToCampaign = async ({
  userEmail,
  userId,
  campaignId,
}: {
  userId?: string;
  userEmail?: string;
  campaignId: string;
}) => {
  if (!(await doesUserOwnCampaign(campaignId))) {
    throw new Error("User does not own campaign");
  }

  if (!userId && !userEmail) {
    throw new Error("One of email or ID must be provided");
  }

  let userIdToAdd: string;
  if (userId) {
    const user = await db.query.user.findFirst({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} was not found`);
    }
    userIdToAdd = userId;
  } else {
    const user = await db.query.user.findFirst({ where: { email: userEmail } });
    if (!user) {
      throw new Error(`User with email ${userEmail} does not exist`);
    }
    userIdToAdd = user.id;
  }
  await db.insert(userCampaign).values({ userId: userIdToAdd, campaignId });
};

export const removeUserFromCampaign = async ({
  userId,
  campaignId,
}: {
  userId: string;
  campaignId: string;
}) => {
  if (!(await doesUserOwnCampaign(campaignId))) {
    throw new Error("User does not own campaign");
  }

  await db
    .delete(userCampaign)
    .where(
      and(
        eq(userCampaign.campaignId, campaignId),
        eq(userCampaign.userId, userId),
      ),
    );
};

export const removeSelfFromCampaign = async (campaignId: string) => {
  const userId = await getCurrentUserId();
  await db
    .delete(userCampaign)
    .where(
      and(
        eq(userCampaign.campaignId, campaignId),
        eq(userCampaign.userId, userId),
      ),
    );
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
