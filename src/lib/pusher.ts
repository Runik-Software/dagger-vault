/** biome-ignore-all lint/style/noNonNullAssertion: May replace later */
import Pusher from "pusher";

import PusherClient from "pusher-js";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export const createPusherClient = (campaignId: string) => {
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/pusher/auth",
    auth: {
      params: {
        campaignId,
      },
    },
  });
};
