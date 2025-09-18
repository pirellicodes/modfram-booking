"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Video, MapPin, Users } from "lucide-react";

interface SessionTypeSelectProps {
  eventType: any;
  bookingData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export function SessionTypeSelect({
  eventType,
  bookingData,
  onUpdate,
  onNext,
}: SessionTypeSelectProps) {
  const [selectedEventType, setSelectedEventType] = useState(
    bookingData.eventType || eventType
  );

  useEffect(() => {
    // Auto-select if there's only one event type (from the slug)
    if (eventType && !bookingData.eventTypeId) {
      setSelectedEventType(eventType);
      onUpdate({
        eventTypeId: eventType.id,
        eventType: eventType,
      });
    }
  }, [eventType, bookingData.eventTypeId, onUpdate]);

  const handleSelect = () => {
    if (selectedEventType) {
      onUpdate({
        eventTypeId: selectedEventType.id,
        eventType: selectedEventType,
      });
      onNext();
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const getLocationIcon = (location: string) => {
    const lowerLocation = location?.toLowerCase() || "";
    if (
      lowerLocation.includes("zoom") ||
      lowerLocation.includes("meet") ||
      lowerLocation.includes("video")
    ) {
      return <Video className="w-4 h-4" />;
    }
    if (lowerLocation.includes("phone") || lowerLocation.includes("call")) {
      return <Users className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Select a Session Type
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose the type of session you&apos;d like to book.
        </p>
      </div>

      <div className="space-y-4">
        <Card
          className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
            selectedEventType?.id === eventType.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
          onClick={() => setSelectedEventType(eventType)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {eventType.title}
              </h3>

              {eventType.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {eventType.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(eventType.duration)}</span>
                </div>

                {eventType.location && (
                  <div className="flex items-center gap-1">
                    {getLocationIcon(eventType.location)}
                    <span>{eventType.location}</span>
                  </div>
                )}

                {eventType.price && eventType.price > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ${eventType.price}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedEventType?.id === eventType.id
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selectedEventType?.id === eventType.id && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSelect}
          disabled={!selectedEventType}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
