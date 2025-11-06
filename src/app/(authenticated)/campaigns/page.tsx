"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createCampaign, getCampaigns } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
});

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  //   const [open, setOpen] = useState(false);

  const { data: campaigns, isPending } = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: z.infer<typeof createCampaignSchema>) =>
      createCampaign(data.name, data.description),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully!");
      //   setOpen(false);
      newCampaignForm.reset();
    },
    onError: () => {
      toast.error("Failed to create campaign.");
    },
  });

  const newCampaignForm = useForm<z.infer<typeof createCampaignSchema>>({
    defaultValues: { name: "", description: "" },
    mode: "onBlur",
    resolver: zodResolver(createCampaignSchema),
  });

  const onSubmit = newCampaignForm.handleSubmit((data) => {
    createCampaignMutation.mutate(data);
  });

  if (isPending) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((id) => (
            <div key={id} className="h-40">
              <Card className="h-full bg-accent/80 shadow-sm rounded-2xl">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <Skeleton className="h-6 w-40 mb-3 rounded-md" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Campaigns</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/80 text-primary-foreground">
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-amber-50 border-amber-200 text-stone-800 max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-amber-900">
                Create New Campaign
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4 mt-2">
              <div>
                <Label htmlFor="name" className="text-amber-900">
                  Campaign Name
                </Label>
                <Input
                  id="name"
                  {...newCampaignForm.register("name")}
                  className="bg-white/90 border-amber-200"
                />
                {newCampaignForm.formState.errors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {newCampaignForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description" className="text-amber-900">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...newCampaignForm.register("description")}
                  className="bg-white/90 border-amber-200"
                  rows={3}
                />
              </div>

              <DialogFooter className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    type="submit"
                    className="bg-amber-700 hover:bg-amber-800 text-amber-50"
                    disabled={createCampaignMutation.isPending}
                  >
                    {createCampaignMutation.isPending
                      ? "Creating..."
                      : "Create Campaign"}
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((camp) => (
            <Link
              key={camp.id}
              href={`/campaigns/${camp.id}`}
              className="block h-full" // 👈 Make the link stretch
            >
              <Card className="h-full bg-accent/80 shadow-sm rounded-2xl hover:shadow-md transition">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <h2 className="text-xl font-semibold text-amber-900">
                      {camp.name}
                    </h2>
                    {camp.description && (
                      <p className="mt-2 text-stone-700">{camp.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-stone-700">
          You have no campaigns. Start by creating one!
        </p>
      )}
    </div>
  );
}
