"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCampaign, updateCampaignSettings } from "@/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { CampaignSettings } from "@/db/schema";

interface CampaignSettingsProps {
  campaignId: string;
}

export default function CampaignSettingsCard({
  campaignId,
}: CampaignSettingsProps) {
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => {
      return getCampaign(campaignId);
    },
  });

  const updateCampaignSettingsMutation = useMutation({
    mutationFn: (settings: Partial<CampaignSettings>) => {
      return updateCampaignSettings(campaignId, settings);
    },
    onSuccess(data) {
      queryClient.setQueryData(["campaign", campaignId], data);
    },
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Campaign not found.</div>;
  }

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Campaign Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="showFearTracker" className="text-sm font-medium">
            Show fear tracker
          </Label>
          <Switch
            id="showFearTracker"
            checked={data.settings?.fearEnabled ?? true}
            onCheckedChange={(checked) => {
              updateCampaignSettingsMutation.mutate({ fearEnabled: checked });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
