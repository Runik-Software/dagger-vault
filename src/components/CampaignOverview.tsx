"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { updateCampaignFear } from "@/actions";
import { authClient } from "@/lib/auth-client";
import { createPusherClient } from "@/lib/pusher";
import type { Campaign } from "@/schema";
import { FearTracker } from "./FearTracker";
import { Card, CardContent } from "./ui/card";

export function CampaignOverview({ campaign }: { campaign: Campaign }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const userOwnsCampaign = useMemo(
    () => campaign.ownerUserId === session?.user.id,
    [campaign, session],
  );

  useEffect(() => {
    const pusher = createPusherClient(campaign.id);

    const channel = pusher.subscribe(`private-campaign-${campaign.id}-fear`);

    channel.bind("update", ({ newValue }: { newValue: number }) => {
      console.log("Received fear update via Pusher", newValue);
      queryClient.setQueryData(["campaign", campaign.id], (old: Campaign) => {
        return {
          ...old,
          fear: newValue,
        };
      });
    });
    return () => {
      pusher.unsubscribe(`private-campaign-${campaign.id}-fear`);
      pusher.disconnect();
    };
  }, [queryClient, campaign.id]);

  const updateFearMutation = useMutation({
    mutationFn: (modifier: number) => {
      return updateCampaignFear(campaign.id, campaign.fear + modifier);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["campaign", data.id], () => data);
    },
  });

  return (
    <Card className="mb-6 bg-accent/80 border-amber-200 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <h1 className="text-3xl font-bold text-amber-900">{campaign.name}</h1>
        {campaign.description && (
          <p className="mt-2 text-stone-700">{campaign.description}</p>
        )}
        {campaign.settings?.fearEnabled && (
          <FearTracker
            fear={campaign.fear}
            userOwnsCampaign={userOwnsCampaign}
            updateFear={(modifier) => updateFearMutation.mutate(modifier)}
          />
        )}
      </CardContent>
    </Card>
  );
}
