"use client";

import { useEffect,useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EventTypeWithParsedFields } from "@/types/event-types";
import type { EventTypeFormData } from "@/types/forms";
import type { LocationObject } from "@/types/location";

import { EventTypeAdvancedForm } from "./EventTypeAdvancedForm";
import { EventTypeAvailabilityForm } from "./EventTypeAvailabilityForm";
import { EventTypeBasicForm } from "./EventTypeBasicForm";
import { EventTypeBookingForm } from "./EventTypeBookingForm";

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
    locations: [{ type: "zoom" } as LocationObject],
    requiresConfirmation: false,
    disableGuests: false,
    hideCalendarNotes: false,
    minimumBookingNotice: 120,
    beforeEventBuffer: 0,
    afterEventBuffer: 0,
    price_cents: 0,
    currency: "USD",
    bookingFields: [],
    bookingLimits: {},
    durationLimits: {},
    recurringEvent: undefined,
    metadata: {},
  });

  const [formData, setFormData] = useState<EventTypeFormData>(
    getInitialFormData()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (eventType) {
      setFormData({
        title: eventType.title || "",
        slug: eventType.slug || "",
        description: eventType.description || "",
        length: eventType.length || 30,
        locations: eventType.locations || [],
        price_cents:
          typeof eventType.price === "string"
            ? Math.round(parseFloat(eventType.price) * 100)
            : typeof eventType.price === "number"
            ? Math.round(eventType.price * 100)
            : (eventType as any).price_cents ?? 0,
        currency: eventType.currency || "USD",
        requiresConfirmation: eventType.requiresConfirmation || false,
        disableGuests: eventType.disableGuests || false,
        hideCalendarNotes: eventType.hideCalendarNotes || false,
        minimumBookingNotice: eventType.minimumBookingNotice || 120,
        beforeEventBuffer: eventType.beforeEventBuffer || 0,
        afterEventBuffer: eventType.afterEventBuffer || 0,
        bookingFields: eventType.bookingFields || [],
        bookingLimits: eventType.bookingLimits || {},
        durationLimits: eventType.durationLimits || {},
        recurringEvent: eventType.recurringEvent || undefined,
        metadata: eventType.metadata || {},
      });
    } else {
      setFormData(getInitialFormData());
    }
  }, [eventType]);

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      alert("Please enter a title for the event type");
      return;
    }
    setIsSaving(true);
    try {
      const url = isEditing
        ? `/api/event-types/${eventType!.id}`
        : "/api/event-types";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        onSave(data.data);
        onOpenChange(false);
        if (!isEditing) {
          setFormData(getInitialFormData());
          setActiveTab("basic");
        }
      } else {
        alert(data.error || "Failed to save event type");
      }
    } catch (err) {
      console.error("Error saving event type:", err);
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
