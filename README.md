# ModFram Booking

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Calendar Components

The project uses two distinct calendar implementations:

### Date Picker Calendar

Located in `src/components/ui/calendar.tsx`, this component is built using `react-day-picker` and is used for simple date selection in forms. Features include:

- Single date selection
- Date range selection
- Customizable styling via shadcn/ui
- Accessible keyboard navigation
- Localization support

Usage example:
```tsx
import { Calendar } from "@/components/calendar"

export function DatePicker() {
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  )
}
```

### Event Calendar

Located in `libs/shadcn-event-calendar`, this is a full-featured event management calendar. Features include:

- Multiple view modes (day, week, month, year)
- Event creation and management
- Drag and drop support
- List view for events
- Customizable event colors and styles
- Responsive design

Usage example:
```tsx
import { EventCalendar } from "@/components/calendar"
import type { Events } from "@/components/calendar/types"

export function BookingCalendar({ events }: { events: Events[] }) {
  return (
    <EventCalendar 
      events={events}
      initialDate={new Date()}
    />
  )
}
```

For more details on calendar implementation, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md).
