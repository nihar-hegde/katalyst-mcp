import { NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/composio";

// This forces the route to be dynamic and not cached.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await getCalendarEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("[API_GET_EVENTS_ERROR]", error);
    // Return a structured error response
    return new NextResponse(
      JSON.stringify({ message: "Failed to fetch calendar events." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
