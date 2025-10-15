"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MinusCircle, PlusCircle, Skull } from "lucide-react";
import { useEffect, useMemo } from "react";
import { updateCampaignFear } from "@/actions";
import { authClient } from "@/lib/auth-client";
import { createPusherClient } from "@/lib/pusher";
import type { Campaign } from "@/schema";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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
      if (!userOwnsCampaign) {
        queryClient.setQueryData(["campaign", campaign.id], (old: Campaign) => {
          return {
            ...old,
            fear: newValue,
          };
        });
      }
    });
    return () => {
      pusher.unsubscribe(`private-campaign-${campaign.id}-fear`);
      pusher.disconnect();
    };
  }, [queryClient, campaign.id, userOwnsCampaign]);

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
        <div className="w-full flex items-center border-2 border-accent bg-destructive/10 rounded-2xl px-2">
          {userOwnsCampaign && (
            <div className="flex items-center">
              <Button
                disabled={campaign.fear <= 0}
                className="rounded-full"
                size="icon"
                onClick={() => updateFearMutation.mutate(-1)}
              >
                <MinusCircle />
              </Button>
            </div>
          )}

          <div className="flex-1 flex justify-around items-center gap-1">
            {new Array(campaign.fear).fill("").map((_, i) => (
              <Skull
                // biome-ignore lint/suspicious/noArrayIndexKey: Just an index
                key={`filled-${i}`}
                className="bg-destructive text-gray-800 rounded-full"
              />
            ))}
            {new Array(12 - campaign.fear).fill("").map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Just an index
              <Skull key={`empty-${i}`} />
            ))}
          </div>

          {userOwnsCampaign && (
            <div className="flex items-center">
              <Button
                disabled={campaign.fear >= 12}
                size="icon"
                className="rounded-full"
                onClick={() => updateFearMutation.mutate(1)}
              >
                <PlusCircle />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
