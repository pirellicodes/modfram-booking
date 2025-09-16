'use client';

import { useState } from 'react';
import { SessionTypeSelect } from './SessionTypeSelect';
import { CalendarPicker } from './CalendarPicker';
import { ClientForm } from './ClientForm';
import { ReviewConfirm } from './ReviewConfirm';
import { SuccessPage } from './SuccessPage';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type BookingStep = 'session' | 'datetime' | 'details' | 'review' | 'success';

interface BookingData {
  eventTypeId?: string;
  eventType?: any;
  selectedDate?: Date;
  selectedTime?: string;
  timezone?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
}

interface BookingWidgetProps {
  eventType: any;
  isEmbed: boolean;
}

export function BookingWidget({ eventType, isEmbed }: BookingWidgetProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('session');
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    { key: 'session', label: 'Session Type', completed: !!bookingData.eventTypeId },
    { key: 'datetime', label: 'Date & Time', completed: !!bookingData.selectedDate && !!bookingData.selectedTime },
    { key: 'details', label: 'Your Details', completed: !!bookingData.clientName && !!bookingData.clientEmail },
    { key: 'review', label: 'Confirm', completed: false }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key as BookingStep);
    }
  };

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key as BookingStep);
    }
  };

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const handleBookingComplete = (bookingId: string) => {
    setCurrentStep('success');
  };

  if (currentStep === 'success') {
    return (
      <SuccessPage
        bookingData={bookingData}
        eventType={eventType}
        isEmbed={isEmbed}
      />
    );
  }

  return (
    <div className={`${isEmbed ? 'max-w-3xl' : 'max-w-4xl'} mx-auto`}>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                    step.key === currentStep
                      ? 'bg-blue-600 text-white border-blue-600'
                      : step.completed
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600'
                  }`}
                >
                  {step.completed ? '✓' : index + 1}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    step.key === currentStep
                      ? 'text-blue-600 dark:text-blue-400'
                      : step.completed
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      {currentStepIndex > 0 && (
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={goBack}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {currentStep === 'session' && (
          <SessionTypeSelect
            eventType={eventType}
            bookingData={bookingData}
            onUpdate={updateBookingData}
            onNext={goNext}
          />
        )}

        {currentStep === 'datetime' && (
          <CalendarPicker
            eventType={bookingData.eventType || eventType}
            bookingData={bookingData}
            onUpdate={updateBookingData}
            onNext={goNext}
          />
        )}

        {currentStep === 'details' && (
          <ClientForm
            bookingData={bookingData}
            onUpdate={updateBookingData}
            onNext={goNext}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'review' && (
          <ReviewConfirm
            bookingData={bookingData}
            eventType={bookingData.eventType || eventType}
            onConfirm={handleBookingComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
    </div>
  );
}
