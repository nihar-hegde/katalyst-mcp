"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

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
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
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
        setIsConnected(false);
        throw new Error(
          errorData.message ||
            "Something went wrong. Please try connecting again."
        );
      }
      const data: CalendarData = await response.json();
      setEvents(data);
      setIsConnected(true);
      setConnectedEmail(data.connectedEmail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      let currentUserId = window.sessionStorage.getItem(
        "composio-calendar-userId"
      );
      if (!currentUserId) {
        currentUserId = crypto.randomUUID();
        window.sessionStorage.setItem(
          "composio-calendar-userId",
          currentUserId
        );
      }
      setUserId(currentUserId);

      const searchParams = new URLSearchParams(window.location.search);
      const wasJustRedirected = searchParams.has("connected_account_id");

      if (wasJustRedirected) {
        setIsConnected(true);
        handleFetchEvents(currentUserId);
        window.history.replaceState(null, "", window.location.pathname);
        setIsCheckingStatus(false);
        return;
      }

      try {
        const statusResponse = await fetch(
          `/api/check-status?userId=${currentUserId}`
        );
        const statusData = await statusResponse.json();
        if (statusData.isConnected) {
          setIsConnected(true);
          setConnectedEmail(statusData.connectedEmail);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        setError("Could not verify connection status.");
        setIsConnected(false);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    initialize();
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
    if (userId) handleFetchEvents(userId);
  };

  const handleGenerateSummary = (EventId: string) => {
    console.log("Generate summary for:", EventId);
  };

  if (isCheckingStatus) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-gray-600">Checking connection status...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Calendar Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Connect your Google Calendar to view and manage your Events
          </p>
        </header>

        {isConnected && (
          <Alert className="mb-6 border-green-200 bg-green-50 max-w-md mx-auto">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Connected</AlertTitle>
            <AlertDescription className="text-green-700">
              {connectedEmail && connectedEmail !== "Unknown Email" ? (
                <>
                  Successfully connected as <strong>{connectedEmail}</strong>
                </>
              ) : (
                "Calendar connected successfully."
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Button
            onClick={handleConnect}
            disabled={isConnecting || isConnected}
            size="lg"
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
          >
            {isConnected
              ? "✓ Calendar Connected"
              : "1. Connect Google Calendar"}
          </Button>
          <Button
            onClick={onFetchClick}
            disabled={isLoading || !isConnected}
            size="lg"
            variant="default"
          >
            {isLoading ? "Fetching..." : "2. Fetch Events"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Upcoming Events
              </h2>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Past Events
              </h2>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !events && !error && (
          <div className="text-center py-16 bg-gray-50/50 rounded-lg">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-500">
              Connect your account and fetch events to see them here.
            </p>
          </div>
        )}

        {events && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-8 bg-blue-600 rounded"></div>Upcoming
                Events
              </h2>
              <div className="space-y-4">
                {events.futureEvents?.items?.length > 0 ? (
                  events.futureEvents.items.map((event: any) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      summary={event.summary}
                      start={event.start}
                      end={event.end}
                      description={event.description}
                      attendees={event.attendees}
                      hangoutLink={event.hangoutLink}
                      status={event.status}
                      isPast={false}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 rounded-lg border-2 border-dashed">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No upcoming events found.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-8 bg-purple-600 rounded"></div>Past Events
              </h2>
              <div className="space-y-4">
                {events.pastEvents?.items?.length > 0 ? (
                  events.pastEvents.items.map((event: any) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      summary={event.summary}
                      start={event.start}
                      end={event.end}
                      description={event.description}
                      attendees={event.attendees}
                      hangoutLink={event.hangoutLink}
                      status={event.status}
                      isPast={true}
                      onGenerateSummary={handleGenerateSummary}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 rounded-lg border-2 border-dashed">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No past events found.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
