"use client";

import { useState, useEffect } from "react";

interface CalendarData {
  pastEvents: any;
  futureEvents: any;
  connectedEmail: string;
}

export default function HomePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);

  const handleFetchEvents = async (idToFetch: string) => {
    setIsLoading(true);
    setError(null);
    setEvents(null);

    try {
      const response = await fetch(`/api/get-events?userId=${idToFetch}`);
      if (!response.ok) {
        const errorData = await response.json();
        // If fetch fails, reset connection status so user can try connecting again.
        setIsConnected(false);
        localStorage.removeItem("composio-isConnected");
        localStorage.removeItem("composio-connectedEmail");
        throw new Error(
          errorData.message ||
            "Something went wrong. Please try connecting again."
        );
      }
      const data: CalendarData = await response.json();
      setEvents(data);

      // On successful fetch, update connection state and email
      setIsConnected(true);
      setConnectedEmail(data.connectedEmail);
      localStorage.setItem("composio-isConnected", "true");
      if (data.connectedEmail) {
        localStorage.setItem("composio-connectedEmail", data.connectedEmail);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let currentUserId = localStorage.getItem("composio-calendar-userId");
    if (!currentUserId) {
      currentUserId = crypto.randomUUID();
      localStorage.setItem("composio-calendar-userId", currentUserId);
    }
    setUserId(currentUserId);

    const searchParams = new URLSearchParams(window.location.search);
    const wasJustRedirected = searchParams.has("connected_account_id");

    // --- THE FIX IS HERE ---

    // 1. If the user was just redirected back from the auth flow...
    if (wasJustRedirected) {
      // Optimistically set the state to connected. This immediately enables the "Fetch" button.
      setIsConnected(true);
      localStorage.setItem("composio-isConnected", "true");

      // Then, automatically trigger the data fetch.
      handleFetchEvents(currentUserId);

      // Finally, clean the URL to prevent re-fetching on page refresh.
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      // 2. If it's a normal page load, just check localStorage like before.
      const storedIsConnected =
        localStorage.getItem("composio-isConnected") === "true";
      const storedEmail = localStorage.getItem("composio-connectedEmail");
      if (storedIsConnected) {
        setIsConnected(true);
        setConnectedEmail(storedEmail);
      }
    }
  }, []);

  const handleConnect = async () => {
    if (!userId) return;
    setIsConnecting(true);
    setError(null);
    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error || "Failed to get connection URL.");
      }
      window.location.href = data.redirectUrl;
    } catch (err: any) {
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const onFetchClick = () => {
    if (userId) {
      handleFetchEvents(userId);
    }
  };

  return (
    <main className="container mx-auto p-8 font-sans bg-gray-50 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">My Calendar Events</h1>
        <p className="text-lg text-gray-600 mt-2">
          Connect your Google Account to see your calendar.
        </p>
      </header>

      {isConnected && connectedEmail && (
        <div className="text-center mb-4 text-sm text-green-700">
          <p>
            Successfully connected as: <strong>{connectedEmail}</strong>
          </p>
        </div>
      )}

      <div className="text-center mb-8 space-x-4">
        <button
          onClick={handleConnect}
          disabled={isConnecting || isConnected}
          className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 disabled:opacity-50 transition-opacity"
        >
          {isConnected ? "Calendar Connected" : "1. Connect Google Calendar"}
        </button>
        <button
          onClick={onFetchClick}
          disabled={isLoading || !isConnected}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:opacity-50 transition-opacity"
        >
          {isLoading ? "Fetching..." : "2. Fetch Events"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <h3 className="font-bold">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !events && !error && (
        <div className="text-center text-gray-500 mt-12">
          <p>Connect your account and then fetch events to see them here.</p>
        </div>
      )}

      {events && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Upcoming Events
            </h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg shadow-md overflow-auto text-sm h-[500px]">
              {JSON.stringify(events.futureEvents, null, 2)}
            </pre>
          </section>
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
