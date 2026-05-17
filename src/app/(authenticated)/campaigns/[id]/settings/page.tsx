"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { doesUserOwnCampaign } from "@/actions";
import CampaignSettingsCard from "@/components/CampaignSettings";
import CampaignUserSettings from "@/components/CampaignUserSettings";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignSettingsPage() {
  const { id: campaignId } = useParams<{ id: string }>();

  const { data: userOwnsCampaign, isPending } = useQuery({
    queryKey: ["campaign-owned", campaignId],
    queryFn: () => {
      return doesUserOwnCampaign(campaignId);
    },
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <CampaignUserSettings campaignId={campaignId} />
      {userOwnsCampaign && <CampaignSettingsCard campaignId={campaignId} />}
    </div>
  );
}
