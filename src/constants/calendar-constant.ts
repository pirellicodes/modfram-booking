import { de, enGB, enUS, es, fr, id, ja, ko } from "date-fns/locale";

import type { CalendarEvent } from "@/types/calendar";

export const EVENT_DEFAULTS = {
  START_TIME: "09:00",
  END_TIME: "10:00",
  COLOR: "blue",
  CATEGORY: "workshop",
} as const;

export const EVENT_COLORS = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "amber", label: "Amber" },
  { value: "yellow", label: "Yellow" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "pink", label: "Pink" },
  { value: "indigo", label: "Indigo" },
  { value: "teal", label: "Teal" },
] as const;

export const CATEGORY_OPTIONS = [
  { value: "workshop", label: "Workshop" },
  { value: "conference", label: "Konferensi" },
  { value: "seminar", label: "Seminar" },
  { value: "social", label: "Sosial" },
] as const;

export const demoEvents = [
  {
    id: "1",
    title: "Team Meeting",
    description: "Weekly team sync",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    location: null,
    category: "Work",
    color: "blue",
  },
  {
    id: "2",
    title: "Product Review",
    description: "New feature walkthrough",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    location: null,
    category: "Product",
    color: "green",
  },
] as CalendarEvent[];

// Define the missing EventTypes constant
export const EventTypes = {
  PERSONAL: "personal",
  BUSINESS: "business",
  MEETING: "meeting",
} as const;

export type EventTypeCategory = (typeof EventTypes)[keyof typeof EventTypes];

export const LOCALES = [
  { value: "en-US", label: "English (US)", locale: enUS },
  { value: "en-GB", label: "English (UK)", locale: enGB },
  { value: "id-ID", label: "Bahasa Indonesia", locale: id },
  { value: "es-ES", label: "Español", locale: es },
  { value: "fr-FR", label: "Français", locale: fr },
  { value: "de-DE", label: "Deutsch", locale: de },
  { value: "ja-JP", label: "日本語", locale: ja },
  { value: "ko-KR", label: "한국어", locale: ko },
] as const;
export type LocaleCode = (typeof LOCALES)[number]["value"];
