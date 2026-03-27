"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getCampaign } from "@/actions";
import { CampaignOverview } from "@/components/CampaignOverview";
import { Button } from "@/components/ui/button";
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
  );
}
