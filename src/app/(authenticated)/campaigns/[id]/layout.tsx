"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getCampaign } from "@/actions";
import { CampaignOverview } from "@/components/CampaignOverview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignRollsProvider } from "@/context/CampaignRollsContext";
import { authClient } from "@/lib/auth-client";

export default function CampaignLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
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
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-48 rounded-full" />
            <Skeleton className="h-4 w-64 rounded-full" />
          </div>
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>

        <Skeleton className="h-72 rounded-[2rem]" />

        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((nav) => (
            <Skeleton key={nav} className="h-11 w-32 rounded-full" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((card) => (
            <div
              key={card}
              className="space-y-4 rounded-3xl border border-border p-6"
            >
              <Skeleton className="h-7 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <div className="p-6">Campaign not found.</div>;
  }

  return (
    <CampaignRollsProvider campaignId={campaignId}>
      <div className="container mx-auto p-6">
        <Link href="/campaigns" className="mb-4 inline-block">
          <Button>
            <SquareArrowLeft /> Back
          </Button>
        </Link>
        <CampaignOverview campaign={campaign} />

        <div className="w-full">
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <Link href={`/campaigns/${campaignId}`}>
                <Button
                  variant={
                    pathname === `/campaigns/${campaignId}`
                      ? "default"
                      : "outline"
                  }
                >
                  Characters
                </Button>
              </Link>
              <Link href={`/campaigns/${campaignId}/dice`}>
                <Button
                  variant={
                    pathname === `/campaigns/${campaignId}/dice`
                      ? "default"
                      : "outline"
                  }
                >
                  Dice Rolls
                </Button>
              </Link>
              <Link href={`/campaigns/${campaignId}/personal-space`}>
                <Button
                  variant={
                    pathname === `/campaigns/${campaignId}/personal-space`
                      ? "default"
                      : "outline"
                  }
                >
                  Personal Space
                </Button>
              </Link>
              <Link href={`/campaigns/${campaignId}/settings`}>
                <Button
                  variant={
                    pathname === `/campaigns/${campaignId}/settings`
                      ? "default"
                      : "outline"
                  }
                >
                  Settings
                </Button>
              </Link>
              {userOwnsCampaign && (
                <Link href={`/campaigns/${campaignId}/users`}>
                  <Button
                    variant={
                      pathname === `/campaigns/${campaignId}/users`
                        ? "default"
                        : "outline"
                    }
                  >
                    Users
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </CampaignRollsProvider>
  );
}
