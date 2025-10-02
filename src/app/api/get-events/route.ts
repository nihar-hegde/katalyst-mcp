import { NextRequest, NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/composio";

// This forces the route to be dynamic and not cached.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Extract the userId from the request's URL query parameters
  const userId = req.nextUrl.searchParams.get("userId");

  // Add a check to ensure the userId was provided
  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    // Pass the dynamic userId to our data-fetching function
    const events = await getCalendarEvents(userId);
    return NextResponse.json(events);
  } catch (error) {
    console.error("[API_GET_EVENTS_ERROR]", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to fetch calendar events." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
