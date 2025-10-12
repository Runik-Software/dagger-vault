import { NextResponse } from "next/server";
import { canUserViewCampaign } from "@/actions";
import { auth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {
  const body = await req.formData();

  // verify the user is authenticated
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // optionally: ensure the user has access to that campaign
  // e.g. parse campaignId from channel_name and check DB here
  console.log("Pusher body", body);
  const socketId = body.get("socket_id") as string;
  const channelName = body.get("channel_name") as string;
  const campaignId = body.get("campaignId") as string;

  if (!socketId || !channelName) {
    return new NextResponse("Bad request", { status: 400 });
  }

  if (!(await canUserViewCampaign(campaignId, session.user.id))) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const authResponse = pusher.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
