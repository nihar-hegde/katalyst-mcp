import { Composio } from "@composio/core";
import { NextResponse, type NextRequest } from "next/server";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
});

const authConfigId = process.env.GOOGLE_CALENDAR_AUTH_CONFIG_ID!;

export async function POST(req: NextRequest) {
  if (!authConfigId) {
    return NextResponse.json(
      { error: "Auth config ID is not configured in the environment." },
      { status: 500 }
    );
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const existingConnections = await composio.connectedAccounts.list({
      userId: userId,
    });

    const googleConnection = existingConnections.items.find(
      (account: any) => account.authConfig?.id === authConfigId
    );

    const callbackUrl = req.nextUrl.origin;

    if (googleConnection) {
      // THE FIX: If a connection exists, redirect back to the app
      // and manually add the `connected_account_id` query parameter.
      // This will make the frontend's existing useEffect hook trigger a fetch.
      console.log(
        `[API_CONNECT] User ${userId} is already connected. Redirecting back with fetch trigger.`
      );
      const redirectUrlWithParam = `${callbackUrl}?connected_account_id=${googleConnection.id}`;
      return NextResponse.json({ redirectUrl: redirectUrlWithParam });
    }

    // If no connection is found, proceed to initiate a new one.
    console.log(
      `[API_CONNECT] No connection found for ${userId}. Initiating new one.`
    );

    const connectionRequest = await composio.connectedAccounts.initiate(
      userId,
      authConfigId,
      {
        callbackUrl: callbackUrl,
      }
    );

    return NextResponse.json({ redirectUrl: connectionRequest.redirectUrl });
  } catch (error) {
    console.error("[API_CONNECT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to initiate connection." },
      { status: 500 }
    );
  }
}
