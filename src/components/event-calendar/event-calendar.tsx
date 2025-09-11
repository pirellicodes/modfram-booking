'use client';

import React, { useEffect, useMemo } from 'react';

import { EventsList } from './event-list';
import { EventCalendarDay } from './event-calendar-day';
import { EventCalendarWeek } from './event-calendar-week';
import EventDialog from './event-dialog';
import { useEventCalendarStore } from '@/hooks/use-event';
import { EventCalendarMonth } from './event-calendar-month';
import { MonthDayEventsDialog } from './day-events-dialog';
import EventCreateDialog from './event-create-dialog';
import { useShallow } from 'zustand/shallow';
import { EventCalendarYear } from './event-calendar-year';
import { EventCalendarDays } from './event-calendar-days';
import CalendarToolbar from './event-calendar-toolbar';
import { Events } from '@/types/event';

interface EventCalendarProps {
  events: Events[];
  initialDate: Date;
  onDateChange?: (date: Date) => void;
}

export function EventCalendar({ initialDate, events, onDateChange }: EventCalendarProps) {
  const { viewMode, currentView, daysCount, setSelectedDate } = useEventCalendarStore(
    useShallow((state) => ({
      viewMode: state.viewMode,
      currentView: state.currentView,
      daysCount: state.daysCount,
      setSelectedDate: state.setSelectedDate,
    })),
  );

  // Sync date with parent component
  React.useEffect(() => {
    setSelectedDate(initialDate);
    // Call onDateChange when date changes internally
    if (onDateChange) {
      onDateChange(initialDate);
    }
  }, [initialDate, setSelectedDate, onDateChange]);

  const renderCalendarView = useMemo(() => {
    if (viewMode === 'list') {
      return <EventsList events={events} currentDate={initialDate} />;
    }
    switch (currentView) {
      case 'day':
        return <EventCalendarDay events={events} currentDate={initialDate} />;
      case 'days':
        return (
          <EventCalendarDays
            events={events}
            daysCount={daysCount}
            currentDate={initialDate}
          />
        );
      case 'week':
        return <EventCalendarWeek events={events} currentDate={initialDate} />;
      case 'month':
        return <EventCalendarMonth events={events} baseDate={initialDate} />;
      case 'year':
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
