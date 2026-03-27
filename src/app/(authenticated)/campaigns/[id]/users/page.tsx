"use client";

import { useParams } from "next/navigation";
import { CampaignUsers } from "@/components/CampaignUsers";

export default function CampaignUsersPage() {
  const { id: campaignId } = useParams<{ id: string }>();

  return <CampaignUsers id={campaignId} />;
}
