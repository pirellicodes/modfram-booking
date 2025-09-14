"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useShallow } from "zustand/shallow";

import { deleteEvent, updateEvent } from "@/app/actions";
import { DeleteAlert } from "@/components/event-calendar/ui/delete-alert";
import { FormFooter } from "@/components/event-calendar/ui/form-footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventCalendarStore } from "@/hooks/use-event";
import { ensureDate } from "@/lib/date";
import { getLocaleFromCode } from "@/lib/event";
import { eventFormSchema } from "@/lib/validations";

import { ScrollArea } from "../ui/scroll-area";
import { EventDetailsForm } from "./event-detail-form";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "10:00";
const DEFAULT_COLOR = "bg-red-600";
const DEFAULT_CATEGORY = "workshop";

type EventFormValues = z.infer<typeof eventFormSchema>;

const DEFAULT_FORM_VALUES: EventFormValues = {
  title: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  category: DEFAULT_CATEGORY,
  startTime: DEFAULT_START_TIME,
  endTime: DEFAULT_END_TIME,
  location: "",
  color: DEFAULT_COLOR,
};

function useIsMounted() {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return isMounted;
}

export default function EventDialog() {
  const {
    locale,
    selectedEvent,
    isDialogOpen,
    closeEventDialog,
    isSubmitting,
  } = useEventCalendarStore(
    useShallow((state) => ({
      locale: state.locale,
      selectedEvent: state.selectedEvent,
      isDialogOpen: state.isDialogOpen,
      closeEventDialog: state.closeEventDialog,
      isSubmitting: state.isSubmitting,
    }))
  );
  const localeObj = getLocaleFromCode(locale);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const isMounted = useIsMounted();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });

  useEffect(() => {
    if (selectedEvent) {
      try {
        const startDate = ensureDate(
          selectedEvent.startDate || selectedEvent.start
        );
        const endDate = ensureDate(selectedEvent.endDate || selectedEvent.end);

        form.reset({
          title: selectedEvent.title || "",
          description: selectedEvent.description || "",
          startDate,
          endDate,
          category: selectedEvent.category || DEFAULT_CATEGORY,
          startTime:
            selectedEvent.startTime ||
            format(selectedEvent.start, "HH:mm") ||
            DEFAULT_START_TIME,
          endTime:
            selectedEvent.endTime ||
            format(selectedEvent.end, "HH:mm") ||
            DEFAULT_END_TIME,
          location:
            typeof selectedEvent.location === "object"
              ? selectedEvent.location?.address || ""
              : selectedEvent.location || "",
          color: selectedEvent.color || "gray",
        });
      } catch (error) {
        console.error("Error resetting form with event data:", error);
      }
    }
  }, [selectedEvent, form]);

  const handleUpdate = async (values: EventFormValues) => {
    if (!selectedEvent?.id) return;

    // Transform values to match expected API format
    const eventData = {
      ...values,
      location:
        typeof values.location === "string"
          ? { type: "custom" as const, address: values.location }
          : values.location,
    };
    toast.promise(updateEvent(selectedEvent.id, eventData), {
      loading: "Updating event...",
      success: (result) => {
        closeEventDialog();
        return "Event updated successfully!";
      },
      error: (error) => {
        console.error("Error:", error);
        return error instanceof Error
          ? error.message
          : "Ops! Something went wrong";
      },
    });
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id) return;
    setIsDeleteAlertOpen(false);

    toast.promise(deleteEvent(selectedEvent.id), {
      loading: "Deleting event...",
      success: (result) => {
        closeEventDialog();
        return "Event deleted successfully!";
      },
      error: (error) => {
        console.error("Error:", error);
        return error instanceof Error
          ? error.message
          : "Ops! Something went wrong";
      },
    });
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={closeEventDialog} modal={false}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Event Details</DialogTitle>
          <DialogDescription>
            Event details {selectedEvent?.title}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[350px] w-full sm:h-[500px]">
          <EventDetailsForm
            form={form}
            onSubmit={handleUpdate}
            locale={localeObj}
          />
        </ScrollArea>
        <DialogFooter className="mt-2 flex flex-row">
          <DeleteAlert
            isOpen={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
            onConfirm={handleDeleteEvent}
          />
          <FormFooter
            onCancel={closeEventDialog}
            onSave={form.handleSubmit(handleUpdate)}
            isSubmitting={isSubmitting}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
