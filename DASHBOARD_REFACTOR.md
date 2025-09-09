# ModFram Booking - Admin Dashboard Refactor

This document outlines the complete refactor of the admin dashboard to match Cal.com's style and functionality.

## 🎯 Overview

The dashboard has been completely redesigned with a modern, Cal.com-inspired interface featuring:

- **Clean Navigation**: Streamlined sidebar with collapsible menu items
- **Comprehensive Analytics**: Rich charts and insights powered by Recharts
- **Full CRUD Operations**: Complete management of bookings, event types, and availability
- **Real-time Data**: Live updates from Supabase database
- **Responsive Design**: Mobile-first approach with shadcn/ui components

## 📁 Project Structure

```
src/
├── app/(admin)/admin/
│   ├── page.tsx                    # Main dashboard
│   ├── insights/
│   │   ├── page.tsx               # Analytics overview
│   │   └── bookings-over-time/    # Detailed booking analytics
│   ├── event-types/page.tsx       # Event type management
│   ├── bookings/page.tsx          # Booking management
│   ├── availability/page.tsx      # Schedule management
│   ├── calendar/page.tsx          # Calendar view
│   └── settings/
│       └── email/page.tsx         # Email configuration
├── components/
│   ├── charts/                    # Analytics components
│   │   ├── BookingsOverTimeChart.tsx
│   │   ├── RevenueBySessionChart.tsx
│   │   ├── PopularSessionCategoriesChart.tsx
│   │   ├── ClientAcquisitionChart.tsx
│   │   └── RecentPayments.tsx
│   ├── EventTypes.tsx             # Event type management
│   ├── Bookings.tsx              # Booking management
│   ├── Availability.tsx          # Schedule management
│   ├── Calendar.tsx              # Calendar component
│   └── EmailSettings.tsx         # Email configuration
├── hooks/
│   └── use-dashboard-data.ts      # Data fetching hooks
└── lib/
    └── types/database.ts          # TypeScript types
```

## 🗺️ Navigation Structure

### Main Navigation
- **Dashboard** (`/admin`) - Overview with key metrics and charts
- **Insights** (`/admin/insights`) - Comprehensive analytics suite
- **Event Types** (`/admin/event-types`) - Manage booking types
- **Bookings** (`/admin/bookings`) - View and manage appointments
- **Availability** (`/admin/availability`) - Set weekly schedule
- **Calendar** (`/admin/calendar`) - Calendar view of bookings

### Settings
- **Account** (`/admin/settings/account`) - User profile settings
- **Notifications** (`/admin/settings/notifications`) - Notification preferences
- **Email Settings** (`/admin/settings/email`) - SMTP configuration and templates

## 📊 Analytics & Charts

### Dashboard Overview
- **Total Bookings**: All-time booking count with trend indicators
- **Total Revenue**: Revenue from successful payments
- **Total Clients**: Registered client count
- **Upcoming Bookings**: Sessions scheduled for next 30 days

### Insights Section
1. **Bookings Over Time** - Line/Area chart showing booking trends
2. **Revenue by Session Type** - Bar chart of revenue breakdown
3. **Popular Session Categories** - Pie chart of most booked categories
4. **Client Acquisition** - New vs returning clients analysis
5. **Recent Payments** - Table of latest transactions

### Chart Features
- Interactive tooltips with detailed information
- Responsive design that adapts to screen size
- Export functionality for data analysis
- Real-time updates from Supabase

## 🗄️ Database Schema

### Core Tables
```sql
-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event types table
CREATE TABLE event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  description TEXT,
  price_cents INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  category TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  currency TEXT DEFAULT 'usd',
  provider TEXT DEFAULT 'stripe',
  status TEXT CHECK (status IN ('pending','succeeded','failed')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability table
CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  day_of_week INT NOT NULL, -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎨 UI Components

### Design System
- **shadcn/ui**: Base component library
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Consistent iconography
- **Recharts**: Interactive data visualization

### Key Features
- **Dark/Light Mode**: Theme switching support
- **Responsive Layout**: Mobile-first design
- **Loading States**: Skeleton screens during data fetch
- **Error Handling**: Graceful error messages
- **Form Validation**: Real-time input validation

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### SMTP Configuration
Configure email settings in the Email Settings page:
- SMTP server details (host, port, credentials)
- Email templates for confirmations, reminders, cancellations
- Notification preferences and timing

## 📱 Features by Page

### Dashboard (`/admin`)
- Key metrics cards with trend indicators
- Quick access charts (Bookings Over Time, Popular Categories)
- Recent payments table
- Revenue and booking summaries

### Insights (`/admin/insights`)
- Comprehensive analytics suite
- All chart components in organized layout
- Export and refresh functionality
- KPI cards with performance indicators

### Event Types (`/admin/event-types`)
- CRUD operations for event types
- Pricing and duration configuration
- Category management
- Usage statistics

### Bookings (`/admin/bookings`)
- Filterable booking list
- Search functionality
- Status management (upcoming, completed, cancelled)
- Client information and contact details

### Availability (`/admin/availability`)
- Weekly schedule configuration
- Time slot management
- Quick actions for common schedules
- Visual availability overview

### Calendar (`/admin/calendar`)
- Month view with booking indicators
- Day detail view with appointments
- Booking status visualization
- Quick booking creation

### Email Settings (`/admin/settings/email`)
- SMTP server configuration
- Email template customization
- Notification preferences
- Test email functionality

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

3. **Run Database Migrations**
   ```sql
   -- Execute the SQL schemas in your Supabase dashboard
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Admin Dashboard**
   ```
   http://localhost:3000/admin
   ```

## 🔍 Data Flow

1. **Data Fetching**: Custom hooks in `use-dashboard-data.ts`
2. **Real-time Updates**: Supabase subscriptions for live data
3. **Caching**: React Query patterns for efficient data management
4. **State Management**: React useState and useEffect for component state

## 🎯 Key Improvements

### From Old Dashboard
- ✅ Modern Cal.com-inspired design
- ✅ Comprehensive analytics suite
- ✅ Real-time data updates
- ✅ Mobile-responsive layout
- ✅ TypeScript type safety
- ✅ Modular component architecture

### Performance Optimizations
- Lazy loading for chart components
- Efficient data fetching with pagination
- Memoized calculations for heavy computations
- Optimized re-renders with React best practices

## 🛠️ Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Bulk operations for bookings
- [ ] Integration with calendar providers
- [ ] Advanced reporting features
- [ ] Multi-user permission system

## 📚 Dependencies

### Core
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### UI Components
- **@radix-ui**: Unstyled accessible components
- **shadcn/ui**: Pre-built components
- **lucide-react**: Icons

### Data & Charts
- **@supabase/supabase-js**: Database client
- **recharts**: Chart library
- **date-fns**: Date manipulation

### Forms & Validation
- **react-hook-form**: Form handling
- **@hookform/resolvers**: Form validation
- **zod**: Schema validation

This refactored dashboard provides a complete, production-ready admin interface for managing bookings, analytics, and business operations with a modern, Cal.com-inspired design.