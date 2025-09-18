'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Mail, Phone, MapPin, MessageSquare, Check } from 'lucide-react';

interface ReviewConfirmProps {
  bookingData: any;
  eventType: any;
  onConfirm: (bookingId: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ReviewConfirm({ bookingData, eventType, onConfirm, isLoading, setIsLoading }: ReviewConfirmProps) {
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string, timezone: string) => {
    const date = new Date(time);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getEndTime = (startTime: string, duration: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toISOString();
  };

  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = new Date(bookingData.selectedTime);
      const endTime = new Date(startTime.getTime() + (eventType.duration || 30) * 60000);

      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type_id: bookingData.eventTypeId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          date: startTime.toISOString().split('T')[0],
          client_name: bookingData.clientName,
          client_email: bookingData.clientEmail,
          client_phone: bookingData.clientPhone,
          notes: bookingData.notes || '',
          timezone: bookingData.timezone,
          slug: eventType.slug
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      onConfirm(result.booking.id);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDate = new Date(bookingData.selectedDate);
  const startTimeFormatted = formatTime(bookingData.selectedTime, bookingData.timezone);
  const endTime = getEndTime(bookingData.selectedTime, eventType.duration || 30);
  const endTimeFormatted = formatTime(endTime, bookingData.timezone);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Confirm Your Booking
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please review your booking details before confirming.
        </p>
      </div>

      {/* Booking Summary Card */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="space-y-4">
          {/* Session Type */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {eventType.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                with {eventType.users?.full_name || 'ModFram'}
              </p>
              {eventType.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {eventType.description}
                </p>
              )}
            </div>
          </div>

          <Separator className="border-blue-200 dark:border-blue-800" />

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {bookingData.timezone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {startTimeFormatted} - {endTimeFormatted}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDuration(eventType.duration || 30)}
                </p>
              </div>
            </div>
          </div>

          {/* Location */}
          {eventType.location && (
            <>
              <Separator className="border-blue-200 dark:border-blue-800" />
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {eventType.location}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Information
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {bookingData.clientName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {bookingData.clientEmail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-500" />
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Phone:</span>
              <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {bookingData.clientPhone}
              </span>
            </div>
          </div>

          {bookingData.notes && (
            <div className="flex items-start gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Notes:</span>
                <p className="ml-2 text-gray-900 dark:text-white font-medium">
                  {bookingData.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </Card>
      )}

      {/* Confirm Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleConfirmBooking}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Confirming Booking...
            </div>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>

      {/* Terms Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By confirming this booking, you agree to our terms of service and acknowledge that
          booking details will be sent to your email address.
        </p>
      </div>
    </div>
  );
}
