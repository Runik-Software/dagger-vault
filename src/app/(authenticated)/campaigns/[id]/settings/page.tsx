"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { doesUserOwnCampaign } from "@/actions";
import CampaignSettingsCard from "@/components/CampaignSettings";
import CampaignUserSettings from "@/components/CampaignUserSettings";

export default function CampaignSettingsPage() {
  const { id: campaignId } = useParams<{ id: string }>();

  const { data: userOwnsCampaign, isPending } = useQuery({
    queryKey: ["campaign-owned", campaignId],
    queryFn: () => {
      return doesUserOwnCampaign(campaignId);
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <CampaignUserSettings campaignId={campaignId} />
      {userOwnsCampaign && <CampaignSettingsCard campaignId={campaignId} />}
    </div>
  );
}
