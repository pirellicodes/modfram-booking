"use client";

import React, { useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { useEventCalendarStore } from "@/hooks/use-event";
import { Events } from "@/types/event";

import { MonthDayEventsDialog } from "./day-events-dialog";
import { EventCalendarDay } from "./event-calendar-day";
import { EventCalendarDays } from "./event-calendar-days";
import { EventCalendarMonth } from "./event-calendar-month";
import CalendarToolbar from "./event-calendar-toolbar";
import { EventCalendarWeek } from "./event-calendar-week";
import { EventCalendarYear } from "./event-calendar-year";
import EventCreateDialog from "./event-create-dialog";
import EventDialog from "./event-dialog";
import { EventsList } from "./event-list";

interface EventCalendarProps {
  events: Events[];
  initialDate: Date;
  onDateChange?: (date: Date) => void;
}

export function EventCalendar({
  initialDate,
  events,
  onDateChange,
}: EventCalendarProps) {
  const { viewMode, currentView, daysCount, setSelectedDate } =
    useEventCalendarStore(
      useShallow((state) => ({
        viewMode: state.viewMode,
        currentView: state.currentView,
        daysCount: state.daysCount,
        setSelectedDate: state.setSelectedDate,
      }))
    );

  // Sync date with parent component - break feedback loop
  React.useEffect(() => {
    const next = initialDate?.getTime?.() ?? 0;
    const curr = selectedDate?.getTime?.() ?? -1;
    if (next === curr) return;
    setSelectedDate(initialDate);
    onDateChange?.(initialDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDate?.getTime?.()]);

  const renderCalendarView = useMemo(() => {
    if (viewMode === "list") {
      return <EventsList events={events} currentDate={initialDate} />;
    }
    switch (currentView) {
      case "day":
        return <EventCalendarDay events={events} currentDate={initialDate} />;
      case "days":
        return (
          <EventCalendarDays
            events={events}
            daysCount={daysCount}
            currentDate={initialDate}
          />
        );
      case "week":
        return <EventCalendarWeek events={events} currentDate={initialDate} />;
      case "month":
        return <EventCalendarMonth events={events} baseDate={initialDate} />;
      case "year":
        return <EventCalendarYear events={events} currentDate={initialDate} />;
      default:
        return <EventCalendarDay events={events} currentDate={initialDate} />;
    }
  }, [currentView, daysCount, events, initialDate, viewMode]);

  return (
    <>
      <EventDialog />
      <MonthDayEventsDialog />
      <EventCreateDialog />
      <div className="bg-background overflow-hidden rounded-xl border shadow-sm">
        <CalendarToolbar />
        <div className="overflow-hidden p-0">{renderCalendarView}</div>
      </div>
    </>
  );
}
