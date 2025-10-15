"use server";

import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { campaign, character, userCampaign } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusher } from "@/lib/pusher";
import type { Campaign, Character, EditCharacter } from "@/schema";

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
  await addUserToCampaign({ userId, campaignId: created.id });
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

export const getCampaignUserDetails = async (campaignId: string) => {
  const userId = await getCurrentUserId();

  return db.query.userCampaign.findFirst({ where: { campaignId, userId } });
};

export const updateUserCampaign = async (
  campaignId: string,
  data: { notes?: string; images?: string[] },
) => {
  if (!data.images && !data.notes) {
    throw new Error("At least one of notes or images must be provided");
  }
  const userId = await getCurrentUserId();
  const [updated] = await db
    .update(userCampaign)
    .set(data)
    .where(
      and(
        eq(userCampaign.campaignId, campaignId),
        eq(userCampaign.userId, userId),
      ),
    )
    .returning();

  return updated;
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

export const updateCampaignFear = async (
  campaignId: string,
  newValue: number,
  delta: boolean = false,
) => {
  let updatedCampaign: Campaign;
  if (delta) {
    const [updated] = await db
      .update(campaign)
      .set({ fear: sql`LEAST(${campaign.fear} + ${newValue}, 12)` })
      .where(eq(campaign.id, campaignId))
      .returning();
    updatedCampaign = updated;
  } else {
    const [updated] = await db
      .update(campaign)
      .set({ fear: newValue })
      .where(eq(campaign.id, campaignId))
      .returning();
    updatedCampaign = updated;
  }
  pusher.trigger(`private-campaign-${campaignId}-fear`, "update", {
    newValue: updatedCampaign.fear,
  });
  return updatedCampaign;
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
  const userId = await getCurrentUserId();
  return db.query.character.findMany({
    where: {
      campaignId,
    },
    orderBy: (t) =>
      sql`CASE WHEN ${t.userId} = ${userId} THEN 0 ELSE 1 END, ${t.name} ASC`,
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
  const userId = await getCurrentUserId();
  const toUpdate = await db.query.character.findFirst({ where: { id } });
  if (!toUpdate) {
    throw new Error("Unable to find character");
  }
  const [updated] = await db
    .update(character)
    .set({
      ...data,
      hope: data.hope
        ? {
            current: Math.min(
              data.hope.current ?? toUpdate.hope.current,
              data.hope.max ?? toUpdate.hope.max,
            ),
            max: data.hope.max ?? toUpdate.hope.max,
          }
        : undefined,
      stress: data.stress
        ? {
            current: Math.min(
              data.stress.current ?? toUpdate.stress.current,
              data.stress.max ?? toUpdate.stress.max,
            ),
            max: data.stress.max ?? toUpdate.stress.max,
          }
        : undefined,
      armourSlots: data.armourSlots
        ? {
            current: Math.min(
              data.armourSlots.current ?? toUpdate.armourSlots.current,
              data.armourSlots.max ?? toUpdate.armourSlots.max,
            ),
            max: data.armourSlots.max ?? toUpdate.armourSlots.max,
          }
        : undefined,
      hitpoints: data.hitpoints
        ? {
            current: Math.min(
              data.hitpoints.current ?? toUpdate.hitpoints.current,
              data.hitpoints.max ?? toUpdate.hitpoints.max,
            ),
            max: data.hitpoints.max ?? toUpdate.hitpoints.max,
          }
        : undefined,
    })
    .where(eq(character.id, id))
    .returning();

  if (
    Object.keys(data).some((key) =>
      ["hope", "stress", "armourSlots", "hitpoints"].includes(key),
    )
  ) {
    pusher.trigger(
      `private-campaign-${updated.campaignId}-characters`,
      "update",
      {
        character: updated,
        triggeredUserId: userId,
      },
    );
  }
  return updated;
};

export const applyCharacterDelta = async (
  id: string,
  data: { hope?: number; stress?: number },
) => {
  const toUpdate = await db.query.character.findFirst({ where: { id } });
  if (!toUpdate) {
    throw new Error("Character not found");
  }
  return await updateCharacter(id, {
    hope: {
      current: Math.min(
        toUpdate.hope.current + (data.hope ?? 0),
        toUpdate.hope.max,
      ),
      max: toUpdate.hope.max,
    },
    stress: {
      current: Math.min(
        toUpdate.stress.current + (data.stress ?? 0),
        toUpdate.stress.max,
      ),
      max: toUpdate.stress.max,
    },
  });
};

export const deleteCharacter = async (id: string) => {
  await db.delete(character).where(eq(character.id, id));
};
