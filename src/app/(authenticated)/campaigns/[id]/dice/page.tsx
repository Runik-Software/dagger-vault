"use client";

import { useParams } from "next/navigation";
import { DiceRoller } from "@/components/DiceRoller";
import { DiceProvider } from "@/context/DiceContext";

export default function CampaignDicePage() {
  const { id: campaignId } = useParams<{ id: string }>();
  return (
    <DiceProvider>
      <div className="container mx-auto p-6">
        <DiceRoller campaignId={campaignId} />
      </div>
    </DiceProvider>
  );
}
