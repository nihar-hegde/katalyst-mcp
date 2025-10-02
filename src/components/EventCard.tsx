import { Calendar, Clock, Users, Video, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Attendee {
  email: string;
  responseStatus: string;
  organizer?: boolean;
  self?: boolean;
}

interface EventCardProps {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  description?: string;
  attendees?: Attendee[];
  hangoutLink?: string;
  status?: string;
  isPast?: boolean;
  onGenerateSummary?: (EventId: string) => void;
}

export function EventCard({
  id,
  summary,
  start,
  end,
  description,
  attendees = [],
  hangoutLink,
  status,
  isPast = false,
  onGenerateSummary,
}: EventCardProps) {
  const startDate = new Date(start.dateTime);
  const endDate = new Date(end.dateTime);
  const durationMinutes = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60)
  );

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const getInitials = (email: string) =>
    (email.split("@")[0] || "").slice(0, 2).toUpperCase();

  const getAvatarBorderColor = (responseStatus: string) => {
    switch (responseStatus) {
      case "accepted":
        return "border-green-400";
      case "declined":
        return "border-red-400";
      case "tentative":
        return "border-yellow-400";
      default:
        return "border-gray-200";
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow duration-300 ${
        isPast ? "bg-gray-50 opacity-90" : "bg-white"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold mb-1 text-gray-800">
              {summary || "Untitled Event"}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {formatDate(startDate)}
            </CardDescription>
          </div>
          {status === "confirmed" && (
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              Confirmed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-medium">
            {formatTime(startDate)} - {formatTime(endDate)}
          </span>
          <span className="text-gray-500">({durationMinutes} min)</span>
        </div>
        {description && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-2">{description}</p>
          </div>
        )}
        {attendees && attendees.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {attendees.length}{" "}
                {attendees.length === 1 ? "Attendee" : "Attendees"}
              </span>
            </div>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {attendees.slice(0, 5).map((attendee, idx) => (
                  <div
                    key={idx}
                    title={`${attendee.email} (${
                      attendee.organizer ? "Organizer" : attendee.responseStatus
                    })`}
                  >
                    <Avatar
                      className={`w-8 h-8 border-2 ${getAvatarBorderColor(
                        attendee.responseStatus
                      )}`}
                    >
                      <AvatarFallback className="text-xs">
                        {getInitials(attendee.email)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
              {attendees.length > 5 && (
                <div className="ml-3 flex items-center justify-center w-8 h-8 text-xs font-medium text-gray-500 bg-gray-100 rounded-full border-2 border-white">
                  +{attendees.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          {hangoutLink && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open(hangoutLink, "_blank")}
            >
              <Video className="w-4 h-4" /> Join Event
            </Button>
          )}
          {isPast && onGenerateSummary && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onGenerateSummary(id)}
            >
              Generate AI Summary
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
