"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getCampaign } from "@/actions";
import { CampaignOverview } from "@/components/CampaignOverview";
import { CampaignUsers } from "@/components/CampaignUsers";
import { Characters } from "@/components/Characters";
import { DiceRoller } from "@/components/DiceRoller";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;

  const { data: session } = authClient.useSession();

  const { data: campaign, isPending } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const campaign = await getCampaign(campaignId);
      if (!campaign) {
        router.replace("/unauthorised");
      }
      return campaign;
    },
  });

  const userOwnsCampaign = useMemo(() => {
    if (!session || !campaign) {
      return undefined;
    }

    return campaign.ownerUserId === session.user.id;
  }, [campaign, session]);

  if (isPending) {
    return <div className="p-6">Loading...</div>;
  }

  if (!campaign) {
    return <div className="p-6">Campaign not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Link href="/campaigns" className="mb-4 inline-block">
        <Button>
          <SquareArrowLeft /> Back
        </Button>
      </Link>
      <CampaignOverview campaign={campaign} />

      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="bg-amber-100 border border-amber-200 rounded-xl p-1 mb-4">
          <TabsTrigger
            value="characters"
            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
          >
            Characters
          </TabsTrigger>
          <TabsTrigger
            value="dice"
            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
          >
            Dice Rolls
          </TabsTrigger>

          {userOwnsCampaign && (
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Users
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="characters">
          <div className="p-4 bg-accent/60 rounded-xl border border-amber-200">
            <Characters campaignId={campaignId} />
          </div>
        </TabsContent>

        <TabsContent value="dice" forceMount>
          <div className="p-4 bg-accent/60 rounded-xl border border-amber-200">
            <DiceRoller campaignId={campaignId} />
          </div>
        </TabsContent>

        {userOwnsCampaign && (
          <TabsContent value="users">
            <div className="p-4 bg-accent/60 rounded-xl border border-amber-200">
              <CampaignUsers id={campaignId} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
