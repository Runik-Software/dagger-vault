"use client";

import { useQuery } from "@tanstack/react-query";
import { SquareArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
        {/* If the tab list is too long, allow items to wrap onto the next row
            instead of scrolling horizontally. We add `flex-wrap` on the
            TabsList and keep each trigger as `flex-none` so items keep their
            natural width and flow to the next line. */}
        <div className="mb-4">
          <div className="bg-amber-100 border border-amber-200 rounded-xl p-1 flex flex-wrap gap-1 !h-auto w-full">
            <Link
              href={`/campaigns/${campaignId}`}
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              <Button variant="ghost">Characters</Button>
            </Link>
            <Link
              href={`/campaigns/${campaignId}/dice`}
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Dice Rolls
            </Link>
            <Link
              href={`/campaigns/${campaignId}/personal-space`}
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Personal space
            </Link>
            <Link
              href={`/campaigns/${campaignId}/settings`}
              className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
            >
              Settings
            </Link>
            {userOwnsCampaign && (
              <Link
                href={`/campaigns/${campaignId}/users`}
                className="!flex-none !h-auto data-[state=active]:bg-amber-700 data-[state=active]:text-amber-50"
              >
                Users
              </Link>
            )}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
