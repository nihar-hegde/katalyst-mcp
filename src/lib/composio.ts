import { Composio } from "@composio/core";
import { format, add, sub } from "date-fns";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

const userId = "default-user";

export interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  description: string | null;
  attendees: {
    email: string;
    responseStatus: string;
  }[];
  hangoutLink: string | null;
}

export async function getCalendarEvents() {
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  try {
    console.log("Fetching past events with correct payload...");
    const pastEvents = await composio.tools.execute(
      "GOOGLECALENDAR_EVENTS_LIST",
      {
        userId,
        arguments: {
          // ADDED: Specify the primary calendar.
          calendarId: "primary",
          timeMax: now.toISOString(),
          timeMin: past.toISOString(),
          maxResults: 5,
          orderBy: "startTime",
          singleEvents: true,
        },
      }
    );

    console.log("Fetched past events:", pastEvents);
    console.log("Fetching future events with correct payload...");

    const futureEvents = await composio.tools.execute(
      "GOOGLECALENDAR_EVENTS_LIST",
      {
        userId,
        arguments: {
          // ADDED: Specify the primary calendar.
          calendarId: "primary",
          timeMin: now.toISOString(),
          timeMax: future.toISOString(),
          maxResults: 5,
          orderBy: "startTime",
          singleEvents: true,
        },
      }
    );

    console.log("Successfully fetched all events.");
    console.log("Fetched future events:", futureEvents);
    return {
      pastEvents: pastEvents.data,
      futureEvents: futureEvents.data,
    };
  } catch (error) {
    console.error("Failed to execute Composio tool:", error);
    throw new Error("Could not fetch calendar events.");
  }
}
