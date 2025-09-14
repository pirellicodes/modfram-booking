import type { LocationObject } from '@/types/location';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;           // combined startDate + startTime
  end: Date;             // combined endDate + endTime
  allDay?: boolean;
  location?: LocationObject | null;
  description?: string | null;
  category?: string | null;
  color?: string | null;
  attendees?: Array<{ id?: string; name?: string; email?: string }>;
  metadata?: Record<string, unknown>;
}
