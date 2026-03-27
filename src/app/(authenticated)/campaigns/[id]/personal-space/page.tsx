"use client";
import { useParams } from "next/navigation";
import { PersonalCampaignSpace } from "@/components/PersonalCampaignSpace";

export default function PersonalSpacePage() {
  const { id: campaignId } = useParams<{ id: string }>();
  return <PersonalCampaignSpace campaignId={campaignId} />;
}
