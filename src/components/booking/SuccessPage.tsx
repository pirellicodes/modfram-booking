"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Clock, Mail, Phone, Copy } from "lucide-react";
import { useState } from "react";

interface SuccessPageProps {
  bookingData: any;
  eventType: any;
  isEmbed: boolean;
}

export function SuccessPage({
  bookingData,
  eventType,
  isEmbed,
}: SuccessPageProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatTime = (time: string, timezone: string) => {
    const date = new Date(time);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  const getEndTime = (startTime: string, duration: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toISOString();
  };

  const generateCalendarLink = () => {
    const startTime = new Date(bookingData.selectedTime);
    const endTime = new Date(
      getEndTime(bookingData.selectedTime, eventType.duration || 30)
    );

    const title = encodeURIComponent(
      `${eventType.title} with ${eventType.users?.full_name || "ModFram"}`
    );
    const details = encodeURIComponent(
      `
Session: ${eventType.title}
Host: ${eventType.users?.full_name || "ModFram"}
${eventType.location ? `Location: ${eventType.location}` : ""}
${bookingData.notes ? `Notes: ${bookingData.notes}` : ""}
    `.trim()
    );

    const startISO = startTime
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const endISO = endTime
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startISO}/${endISO}&details=${details}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const selectedDate = new Date(bookingData.selectedDate);
  const startTimeFormatted = formatTime(
    bookingData.selectedTime,
    bookingData.timezone
  );
  const endTime = getEndTime(
    bookingData.selectedTime,
    eventType.duration || 30
  );
  const endTimeFormatted = formatTime(endTime, bookingData.timezone);

  return (
    <div className={`${isEmbed ? "max-w-2xl" : "max-w-3xl"} mx-auto space-y-6`}>
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your {eventType.title} session has been successfully scheduled.
          </p>
        </div>
      </div>

      {/* Booking Details Card */}
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Session Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {bookingData.timezone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {startTimeFormatted} - {endTimeFormatted}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDuration(eventType.duration || 30)}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {eventType.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              with {eventType.users?.full_name || "ModFram"}
            </p>
            {eventType.location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                📍 {eventType.location}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* What Happens Next */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          What happens next?
        </h2>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Confirmation email sent
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We&apos;ve sent a confirmation email to{" "}
                {bookingData.clientEmail} with all the details.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Phone className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                We&apos;ll be in touch
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You may receive a call or message at {bookingData.clientPhone}{" "}
                if we need to confirm any details.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-3 h-3 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Add to your calendar
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Don&apos;t forget to add this event to your calendar so you
                don&apos;t miss it.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(generateCalendarLink(), "_blank")}
                className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Add to Google Calendar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Need to make changes?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you need to reschedule or cancel your booking, please contact us:
          </p>
          <div className="flex justify-center items-center gap-2 mt-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {eventType.users?.email || "support@modfram.com"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                copyToClipboard(eventType.users?.email || "support@modfram.com")
              }
              className="p-1 h-auto"
            >
              <Copy className="w-3 h-3" />
              {copied && (
                <span className="ml-1 text-xs text-green-600">Copied!</span>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Thank You Message */}
      <div className="text-center py-4">
        <p className="text-gray-600 dark:text-gray-400">
          Thank you for booking with us. We look forward to seeing you!
        </p>
      </div>
    </div>
  );
}
