// app/api/check-status/route.ts

import { ComposioAccount } from "@/types";
import { Composio } from "@composio/core";
import { NextRequest, NextResponse } from "next/server";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
});

const authConfigId = process.env.GOOGLE_CALENDAR_AUTH_CONFIG_ID!;

// This forces the route to be dynamic and not cached.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    const existingConnections = await composio.connectedAccounts.list({
      userId,
    });

    // Find the specific Google Calendar connection
    const googleConnection = existingConnections.items.find(
      (account: ComposioAccount) => account.authConfig?.id === authConfigId
    );
    console.log("Possible email: ", googleConnection?.name);

    if (googleConnection) {
      return NextResponse.json({
        isConnected: true,
        connectedEmail: googleConnection.name || "Unknown Email",
      });
    }

    // If no connection is found
    return NextResponse.json({ isConnected: false });
  } catch (error) {
    console.error("[API_CHECK_STATUS_ERROR]", error);
    return NextResponse.json(
      {
        isConnected: false,
        message: "Failed to check connection status.",
      },
      { status: 500 }
    );
  }
}
