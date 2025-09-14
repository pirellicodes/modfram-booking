"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventTypeBasicForm } from "./EventTypeBasicForm";
import { EventTypeAvailabilityForm } from "./EventTypeAvailabilityForm";
import { EventTypeBookingForm } from "./EventTypeBookingForm";
import { EventTypeAdvancedForm } from "./EventTypeAdvancedForm";
import { type EventType } from "@/db/schema";
import type { EventTypeFormData } from "@/types/forms";

interface LocationObject {
  type: string;
  address?: string;
  link?: string;
  phone?: string;
}

interface BookingField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

interface BookingLimits {
  day?: number;
  week?: number;
  month?: number;
  year?: number;
}

interface DurationLimits {
  min?: number;
  max?: number;
}

interface RecurringEvent {
  freq?: string;
  interval?: number;
  count?: number;
  until?: string;
}

interface EventTypeWithParsedFields
  extends Omit<
    EventType,
    | "locations"
    | "metadata"
    | "bookingFields"
    | "bookingLimits"
    | "durationLimits"
    | "recurringEvent"
  > {
  locations?: LocationObject[];
  metadata?: Record<string, unknown>;
  bookingFields?: BookingField[];
  bookingLimits?: BookingLimits;
  durationLimits?: DurationLimits;
  recurringEvent?: RecurringEvent;
}

interface EventTypeFormProps {
  eventType?: EventTypeWithParsedFields;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (eventType: EventTypeWithParsedFields) => void;
}

export function EventTypeForm({
  eventType,
  open,
  onOpenChange,
  onSave,
}: EventTypeFormProps) {
  const isEditing = !!eventType;

  const getInitialFormData = (): EventTypeFormData => ({
    title: "",
    slug: "",
    description: "",
    length: 30,
    locations: [{ type: "zoom" }],
    hidden: false,
    requiresConfirmation: false,
    disableGuests: false,
    hideCalendarNotes: false,
    minimumBookingNotice: 120,
    beforeEventBuffer: 0,
    afterEventBuffer: 0,
    price: 0,
    currency: "USD",
    slotInterval: undefined,
    onlyShowFirstAvailableSlot: false,
    seatsPerTimeSlot: undefined,
    seatsShowAttendees: false,
    seatsShowAvailabilityCount: true,

    periodType: "UNLIMITED",
    periodDays: undefined,
    periodCountCalendarDays: false,
    bookingFields: [],
    bookingLimits: {},
    durationLimits: {},
    recurringEvent: undefined,
    metadata: {},
    allow_cancellation: true,
    is_active: true,
  });

  const [formData, setFormData] = useState<EventTypeFormData>(
    getInitialFormData()
  );

  // Sync form data when eventType changes
  useEffect(() => {
    if (eventType) {
      setFormData({
        ...eventType,
        is_active: true, // Provide default for missing property
      });
    } else {
      setFormData(getInitialFormData());
    }
  }, [eventType]);

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      alert("Please enter a title for the event type");
      return;
    }

    setIsSaving(true);

    try {
      const url = isEditing
        ? `/api/event-types/${eventType.id}`
        : "/api/event-types";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSave(data.data);
        onOpenChange(false);

        // Reset form if creating new
        if (!isEditing) {
          setFormData({
            title: "",
            slug: "",
            description: "",
            length: 30,
            locations: [{ type: "zoom" }],
            hidden: false,
            requiresConfirmation: false,
            disableGuests: false,
            hideCalendarNotes: false,
            minimumBookingNotice: 120,
            beforeEventBuffer: 0,
            afterEventBuffer: 0,
            price: "0.00",
            currency: "USD",
            slotInterval: null,
            onlyShowFirstAvailableSlot: false,
            seatsPerTimeSlot: null,
            seatsShowAttendees: false,
            seatsShowAvailabilityCount: true,
            assignAllTeamMembers: false,
            periodType: "UNLIMITED",
            periodDays: null,
            periodCountCalendarDays: false,
            bookingFields: [],
            bookingLimits: {},
            durationLimits: {},
            recurringEvent: undefined,
            metadata: {},
          });
          setActiveTab("basic");
        }
      } else {
        alert(data.error || "Failed to save event type");
      }
    } catch (error) {
      console.error("Error saving event type:", error);
      alert("Failed to save event type");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event Type" : "Create Event Type"}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="booking">Booking</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="basic" className="mt-4">
              <EventTypeBasicForm
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

            <TabsContent value="availability" className="mt-4">
              <EventTypeAvailabilityForm
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

            <TabsContent value="booking" className="mt-4">
              <EventTypeBookingForm
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>

            <TabsContent value="advanced" className="mt-4">
              <EventTypeAdvancedForm
                formData={formData}
                setFormData={setFormData}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !formData.title?.trim()}
          >
            {isSaving ? "Saving..." : isEditing ? "Update" : "Create"} Event
            Type
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
