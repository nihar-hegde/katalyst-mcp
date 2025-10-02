import { Composio } from "@composio/core";

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
});

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

export async function getCalendarEvents(userId: string) {
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

  try {
    const pastEvents = await composio.tools.execute(
      "GOOGLECALENDAR_EVENTS_LIST",
      {
        userId,
        arguments: {
          calendarId: "primary",
          timeMax: now.toISOString(),
          timeMin: past.toISOString(),
          maxResults: 5,
          orderBy: "startTime",
          singleEvents: true,
        },
      }
    );

    const futureEvents = await composio.tools.execute(
      "GOOGLECALENDAR_EVENTS_LIST",
      {
        userId,
        arguments: {
          calendarId: "primary",
          timeMin: now.toISOString(),
          timeMax: future.toISOString(),
          maxResults: 5,
          orderBy: "startTime",
          singleEvents: true,
        },
      }
    );

    // THE CHANGE: We now also return the connected email address,
    // which Google provides in the 'summary' field of the response.
    return {
      pastEvents: pastEvents.data,
      futureEvents: futureEvents.data,
      connectedEmail:
        futureEvents.data?.summary || pastEvents.data?.summary || null,
    };
  } catch (error) {
    console.error("Failed to execute Composio tool:", error);
    throw new Error("Could not fetch calendar events.");
  }
}
