# Spec: Calendar, Events, Availability
purpose: replace current calendar with shadcn-event-calendar; mirror Cal.com tabs.
success: month/week/day views; CRUD availability/events; create bookings from slots; RLS-safe.
tables: events(id,user_id,title,start,end,notes); availability(id,user_id,weekday,slots); bookings(id,user_id,client_id,start,end,status).
routes: /admin/bookings, /admin/events, /admin/availability, /charts
api: GET/POST /api/events, /api/availability, /api/bookings
ux: tabs switch; drag to create block; click slot → booking modal; user timezone.
tasks: wire reads; add mutations; server actions with checks; loading/error states; minimal e2e.
