import { ComposioAccount } from "@/types";
import { Composio } from "@composio/core";
import { NextRequest, NextResponse } from "next/server";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY!,
});

const authConfigId = process.env.GOOGLE_CALENDAR_AUTH_CONFIG_ID!;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const existingConnections = await composio.connectedAccounts.list({
      userId,
    });

    const googleConnection = existingConnections.items.find(
      (account: ComposioAccount) => account.authConfig?.id === authConfigId
    );

    if (!googleConnection) {
      return NextResponse.json(
        { error: "No active connection found for this user." },
        { status: 404 }
      );
    }

    await composio.connectedAccounts.delete(googleConnection.id);

    console.log(
      `[API_DISCONNECT] Successfully disconnected user ${userId} (connection: ${googleConnection.id})`
    );

    return NextResponse.json({
      success: true,
      message: "Successfully disconnected from Google Calendar.",
    });
  } catch (error) {
    console.error("[API_DISCONNECT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to disconnect. Please try again." },
      { status: 500 }
    );
  }
}
