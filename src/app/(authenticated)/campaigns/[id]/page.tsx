"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCampaign } from "@/actions";
import { Characters } from "@/components/Characters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CampaignPage() {
  const params = useParams();
  const campaignId = params?.id as string;

  const { data: campaign, isPending } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => getCampaign(campaignId),
  });

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
      <Card className="mb-6 bg-amber-50/80 border-amber-200 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold text-amber-900">{campaign.name}</h1>
          {campaign.description && (
            <p className="mt-2 text-stone-700">{campaign.description}</p>
          )}
        </CardContent>
      </Card>

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
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
          >
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="characters">
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <Characters campaignId={campaignId} />
          </div>
        </TabsContent>

        <TabsContent value="dice">
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <p className="text-stone-700">
              Dice roll history and tools go here...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
            <p className="text-stone-700">
              Campaign user management goes here...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
