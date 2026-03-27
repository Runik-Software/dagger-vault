"use client";

import { useParams } from "next/navigation";
import CampaignUserSettings from "@/components/CampaignUserSettings";

export default function CampaignSettingsPage() {
  const { id: campaignId } = useParams<{ id: string }>();

  return <CampaignUserSettings campaignId={campaignId} />;
}
