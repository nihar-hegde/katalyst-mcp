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
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  try {
    const pastEventsResponse = await composio.tools.execute(
      "GOOGLECALENDAR_EVENTS_LIST",
      {
        userId,
        arguments: {
          calendarId: "primary",
          timeMax: now.toISOString(),
          timeMin: past.toISOString(),
          orderBy: "startTime",
          singleEvents: true,
        },
      }
    );

    const pastEventsData = pastEventsResponse.data;
    if (pastEventsData && pastEventsData.items) {
      pastEventsData.items = pastEventsData.items.reverse().slice(0, 5);
    }

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

    return {
      pastEvents: pastEventsData,
      futureEvents: futureEvents.data,
      connectedEmail:
        futureEvents.data?.summary || pastEventsData?.summary || null,
    };
  } catch (error) {
    console.error("Failed to execute Composio tool:", error);
    throw new Error("Could not fetch calendar events.");
  }
}
