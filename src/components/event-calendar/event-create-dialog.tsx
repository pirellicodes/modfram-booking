"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useShallow } from "zustand/shallow";

import { createEvent } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_DEFAULTS } from "@/constants/calendar-constant";
import { useEventCalendarStore } from "@/hooks/use-event";
import { getLocaleFromCode } from "@/lib/event";
import { createEventSchema } from "@/lib/validations";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { EventDetailsForm } from "./event-detail-form";
import { EventPreviewCalendar } from "./event-preview-calendar";

type EventFormValues = z.infer<typeof createEventSchema>;

const DEFAULT_FORM_VALUES: EventFormValues = {
  title: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(),
  category: EVENT_DEFAULTS.CATEGORY,
  startTime: EVENT_DEFAULTS.START_TIME,
  endTime: EVENT_DEFAULTS.END_TIME,
  location: "",
  color: EVENT_DEFAULTS.COLOR,
  isRepeating: false,
};

export default function EventCreateDialog() {
  const {
    isQuickAddDialogOpen,
    closeQuickAddDialog,
    timeFormat,
    locale,
    quickAddData,
  } = useEventCalendarStore(
    useShallow((state) => ({
      isQuickAddDialogOpen: state.isQuickAddDialogOpen,
      closeQuickAddDialog: state.closeQuickAddDialog,
      timeFormat: state.timeFormat,
      locale: state.locale,
      quickAddData: state.quickAddData,
    }))
  );
  const form = useForm<EventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onChange",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const localeObj = getLocaleFromCode(locale);

  const watchedValues = form.watch();

  const handleSubmit = async (formValues: EventFormValues) => {
    setIsSubmitting(true);

    // Transform form values to match expected API format
    const eventData = {
      ...formValues,
      location:
        typeof formValues.location === "string"
          ? { type: "custom" as const, address: formValues.location }
          : formValues.location,
    };
    toast.promise(createEvent(eventData), {
      loading: "Creating Event...",
      success: (result) => {
        form.reset(DEFAULT_FORM_VALUES);
        setIsSubmitting(false);
        closeQuickAddDialog();
        return "Event Successfully created";
      },
      error: (error) => {
        console.error("Error:", error);
        if (error instanceof Error) {
          return error.message;
        } else if (typeof error === "string") {
          return error;
        } else if (error && typeof error === "object" && "message" in error) {
          return String(error.message);
        }
        return "Ops! something went wrong";
      },
    });
  };

  useEffect(() => {
    if (isQuickAddDialogOpen && quickAddData.date) {
      form.reset({
        ...DEFAULT_FORM_VALUES,
        startDate: quickAddData.date,
        endDate: quickAddData.date,
        startTime: quickAddData.startTime,
        endTime: quickAddData.endTime,
      });
    }
  }, [isQuickAddDialogOpen, quickAddData, form]);

  return (
    <Dialog
      open={isQuickAddDialogOpen}
      onOpenChange={(open) => !open && closeQuickAddDialog()}
      modal={false}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Fill in the event details to add it to the calendar
          </DialogDescription>
        </DialogHeader>
        <Tabs className="w-full" defaultValue="edit">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <ScrollArea className="h-[500px] w-full">
              <EventDetailsForm
                form={form}
                onSubmit={handleSubmit}
                locale={localeObj}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[500px] w-full">
              <EventPreviewCalendar
                watchedValues={watchedValues}
                locale={localeObj}
                timeFormat={timeFormat}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-2">
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
