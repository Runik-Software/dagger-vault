"use client";

import { useParams } from "next/navigation";
import { Characters } from "@/components/Characters";

export default function CampaignPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  return <Characters campaignId={campaignId} />;
}
