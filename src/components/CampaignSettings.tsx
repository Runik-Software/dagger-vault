"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCampaign, updateCampaignSettings } from "@/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="mt-2 h-4 w-64 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-1/2 rounded-md" />
        </CardContent>
      </Card>
    );
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
