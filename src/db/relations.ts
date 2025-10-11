import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  campaign: {
    users: r.many.user({
      from: r.campaign.id.through(r.userCampaign.campaignId),
      to: r.user.id.through(r.userCampaign.userId),
    }),
    owner: r.one.user({
      from: r.campaign.ownerUserId,
      to: r.user.id,
      optional: false,
    }),
    characters: r.many.character({
      from: r.campaign.id,
      to: r.character.campaignId,
    }),
  },
  character: {
    campaign: r.one.campaign({
      from: r.character.campaignId,
      to: r.campaign.id,
      optional: false,
    }),
    user: r.one.user({
      from: r.character.userId,
      to: r.user.id,
      optional: false,
    }),
  },
}));
