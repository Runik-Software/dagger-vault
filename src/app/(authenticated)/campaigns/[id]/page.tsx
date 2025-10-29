"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getCampaign } from "@/actions";
import { CampaignOverview } from "@/components/CampaignOverview";
import CampaignUserSettings from "@/components/CampaignUserSettings";
import { CampaignUsers } from "@/components/CampaignUsers";
import { Characters } from "@/components/Characters";
import { DiceRoller } from "@/components/DiceRoller";
import { PersonalCampaignSpace } from "@/components/PersonalCampaignSpace";
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
        {/* If the tab list is too long, allow items to wrap onto the next row
            instead of scrolling horizontally. We add `flex-wrap` on the
            TabsList and keep each trigger as `flex-none` so items keep their
            natural width and flow to the next line. */}
        <div className="mb-4">
          <TabsList className="bg-amber-100 border border-amber-200 rounded-xl p-1 flex flex-wrap gap-1 !h-auto w-full">
            <TabsTrigger
              value="characters"
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Characters
            </TabsTrigger>
            <TabsTrigger
              value="dice"
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Dice Rolls
            </TabsTrigger>
            <TabsTrigger
              value="personal-space"
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Personal space
            </TabsTrigger>

            <TabsTrigger
              value="settings"
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Settings
            </TabsTrigger>

            {userOwnsCampaign && (
              <TabsTrigger
                value="users"
                className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
              >
                Users
              </TabsTrigger>
            )}
          </TabsList>
        </div>

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

        <TabsContent value="personal-space">
          <div className="p-4 bg-accent/60 rounded-xl border border-amber-200">
            <PersonalCampaignSpace campaignId={campaignId} />
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="p-4 bg-accent/60 rounded-xl border border-amber-200">
            <CampaignUserSettings campaignId={campaignId} />
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
