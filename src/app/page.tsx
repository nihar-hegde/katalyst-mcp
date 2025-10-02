"use client";

import { useState } from "react";

// Define a type for the event data structure for better type safety
interface CalendarData {
  pastEvents: any;
  futureEvents: any;
}

export default function HomePage() {
  const [events, setEvents] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    setEvents(null);

    try {
      const response = await fetch("/api/get-events");
      if (!response.ok) {
        // Handle HTTP errors like 500
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      const data: CalendarData = await response.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-8 font-sans bg-gray-50 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Calendar Events</h1>
        <p className="text-lg text-gray-600 mt-2">
          Click the button below to fetch your upcoming and past meetings via
          Composio.
        </p>
      </header>

      <div className="text-center mb-8">
        <button
          onClick={handleFetchEvents}
          disabled={isLoading}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? "Fetching Events..." : "Fetch My Calendar Events"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <h3 className="font-bold">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      )}

      {events && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Upcoming Events
            </h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg shadow-md overflow-auto text-sm h-[500px]">
              {JSON.stringify(events.futureEvents, null, 2)}
            </pre>
          </section>

          {/* Past Events */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Past Events
            </h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg shadow-md overflow-auto text-sm h-[500px]">
              {JSON.stringify(events.pastEvents, null, 2)}
            </pre>
          </section>
        </div>
      )}
    </main>
  );
}
