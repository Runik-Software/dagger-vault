"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Skull } from "lucide-react";
import { useEffect, useMemo } from "react";
import { updateCampaignFear } from "@/actions";
import { authClient } from "@/lib/auth-client";
import { createPusherClient } from "@/lib/pusher";
import type { Campaign } from "@/schema";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function CampaignOverview({ campaign }: { campaign: Campaign }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  useEffect(() => {
    const pusher = createPusherClient(campaign.id);

    const channel = pusher.subscribe(`private-campaign-${campaign.id}-fear`);

    channel.bind("update", ({ newValue }: { newValue: number }) => {
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
  });

  const userOwnsCampaign = useMemo(
    () => campaign.ownerUserId === session?.user.id,
    [campaign, session],
  );

  return (
    <Card className="mb-6 bg-accent/80 border-amber-200 shadow-sm rounded-2xl">
      <CardContent className="p-6">
        <h1 className="text-3xl font-bold text-amber-900">{campaign.name}</h1>
        {campaign.description && (
          <p className="mt-2 text-stone-700">{campaign.description}</p>
        )}
        <div className="w-full grid grid-cols-12 border-2 border-accent bg-destructive/10 rounded-2xl">
          {new Array(campaign.fear).fill("").map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Just an index
            <div key={i}>
              {userOwnsCampaign ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Skull
                      className="cursor-pointer hover:text-destructive"
                      onClick={() => updateFearMutation.mutate(-1)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              ) : (
                <Skull />
              )}
            </div>
          ))}
          {campaign.fear < 12 && userOwnsCampaign && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Skull
                  className="cursor-pointer bg-green-200 rounded-2xl"
                  onClick={() => updateFearMutation.mutate(1)}
                />
              </TooltipTrigger>
              <TooltipContent>Add fear</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
