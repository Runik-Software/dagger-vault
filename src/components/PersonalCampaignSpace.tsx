"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { getCampaignUserDetails, updateUserCampaign } from "@/actions";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";

export function PersonalCampaignSpace({ campaignId }: { campaignId: string }) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [updatedNotes, setUpdatedNotes] = useState<string>();
  const [newImageUrl, setNewImageUrl] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["userCampaign", { campaignId, userId: session?.user.id }],
    queryFn: async () => {
      const details = (await getCampaignUserDetails(campaignId)) ?? null;
      setUpdatedNotes(details?.notes ?? "");
      return details;
    },
    enabled: !!session?.user,
  });

  const saveMutation = useMutation({
    mutationFn: (data: { notes?: string; images?: string[] }) => {
      return updateUserCampaign(campaignId, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["userCampaign", { campaignId: data.campaignId, userId: data.userId }],
        () => data,
      );
    },
  });

  const addImage = async () => {
    if (!newImageUrl) {
      toast.error("Image url is empty");
      return;
    }
    const res = z.url().safeParse(newImageUrl);
    if (res.error) {
      toast.error("Invalid URL", { description: res.error.message });
      return;
    }

    await saveMutation.mutateAsync({
      images: [...(data?.images ?? []), newImageUrl],
    });
    setNewImageUrl("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <h1 className="text-2xl">Something's gone wrong. Contact support</h1>
      </div>
    );
  }
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Personal Campaign Space</CardTitle>
        <CardDescription>
          A place for your notes and images. Use to make notes on the campaign
          and keep a copy of ability cards handy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          className="bg-primary-foreground"
          value={updatedNotes ?? ""}
          onChange={(e) => setUpdatedNotes(e.target.value)}
          placeholder="Whatever you want. Anything you think will be useful to make a note of"
        />
        <div className="flex justify-end w-full pt-4">
          <Button
            className="mx-2"
            disabled={updatedNotes === data.notes}
            onClick={() => saveMutation.mutate({ notes: updatedNotes ?? "" })}
          >
            <Save />
            Save
          </Button>
          <Button
            className=""
            disabled={updatedNotes === data.notes}
            onClick={() => setUpdatedNotes(`${data.notes}`)}
          >
            Reset
          </Button>
        </div>
        <div className="flex mt-4">
          <Input
            placeholder="Image Url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <Button
            disabled={!newImageUrl}
            className="ml-2"
            onClick={() => addImage()}
          >
            Add
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 border-8">
          {(data.images ?? []).map((i) => (
            <div key={i} className="relative overflow-hidden rounded h-40">
              {/* biome-ignore lint/performance/noImgElement: Don't care */}
              <img
                src={i}
                // biome-ignore lint/a11y/noRedundantAlt: Nothing else fits
                alt={`Image $i`}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-75 transition-opacity">
                <Button
                  className="bg-red-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveMutation.mutate({
                      images: (data.images ?? []).filter((img) => img !== i),
                    });
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
