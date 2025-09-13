# Test Plan: Cal.com-style Dashboard Refactor

## Overview
Manual testing steps to verify the refactored booking dashboard functionality.

## Prerequisites
- Application running on localhost with Next.js dev server
- User authenticated and logged into admin dashboard
- Supabase database properly configured with RLS policies

## Test Cases

### 1. Navigation & Layout
**Objective**: Verify the new Cal.com-style sidebar navigation
- [ ] Navigate to `/admin` - verify sidebar shows grouped sections:
  - General: Dashboard, Bookings, Events, Availability, Calendar  
  - Analytics: Charts, Insights
  - Settings: Event Types
- [ ] Click each navigation item to verify routing works
- [ ] Verify responsive behavior on mobile/tablet

### 2. Events Management (`/admin/events`)
**Objective**: Test full CRUD functionality for events

#### Create Event
- [ ] Navigate to `/admin/events`
- [ ] Click "New Event" button
- [ ] Fill in form: title, start date/time, end date/time, notes
- [ ] Submit form - verify event appears in table
- [ ] Verify event shows correct duration calculation

#### Edit Event  
- [ ] Click pencil icon on existing event
- [ ] Modify event details
- [ ] Submit form - verify changes reflect in table
- [ ] Verify datetime formatting is correct

#### Delete Event
- [ ] Click delete button (trash icon) on event
- [ ] Confirm deletion in dialog
- [ ] Verify event removed from table

#### API Testing
- [ ] Open browser dev tools, verify API calls:
  - GET `/api/events` loads events
  - POST `/api/events` creates new event
  - PUT `/api/events` updates event  
  - DELETE `/api/events?id=<uuid>` removes event

### 3. Availability Management (`/admin/availability`)
**Objective**: Test enhanced availability page with calendar view

#### Weekly Schedule Tab
- [ ] Navigate to `/admin/availability`
- [ ] Verify "Weekly Schedule" tab shows existing Availability component
- [ ] Test existing availability functionality

#### Calendar View Tab  
- [ ] Switch to "Calendar View" tab
- [ ] Verify shadcn-event-calendar renders properly
- [ ] Test calendar navigation (month/week/day views)
- [ ] Verify empty state shows correctly (no availability events yet)

### 4. Charts & Analytics (`/charts`)
**Objective**: Verify new charts page functionality

#### Overview Tab
- [ ] Navigate to `/charts`  
- [ ] Verify 4 chart components render:
  - Bookings Over Time
  - Revenue by Session
  - Popular Session Categories  
  - Upcoming Bookings
- [ ] Check for any console errors

#### Other Tabs
- [ ] Switch between Bookings, Revenue, Clients tabs
- [ ] Verify appropriate charts show in each tab
- [ ] Verify Recent Payments table renders in Revenue tab

### 5. Bookings (`/admin/bookings`)
**Objective**: Test existing bookings functionality still works

#### Bookings API
- [ ] Test new API endpoint: GET `/api/bookings`
- [ ] Verify returns bookings with client relationships
- [ ] Check RLS authentication (should require login)

#### Bookings Interface
- [ ] Navigate to `/admin/bookings`
- [ ] Verify existing bookings interface still functions
- [ ] Test search and filtering
- [ ] Verify "New Booking" button present

### 6. Authentication & Security
**Objective**: Verify RLS policies work correctly

#### API Security
- [ ] Test API endpoints without authentication:
  - `/api/events` should return 401
  - `/api/bookings` should return 401  
  - `/api/availability` should return 401
- [ ] Test with valid auth - should return user's data only
- [ ] Test cross-user access prevention

### 7. Error Handling
**Objective**: Test error states and loading

#### Loading States
- [ ] Verify loading spinners show during API calls
- [ ] Test slow network simulation

#### Error States  
- [ ] Test with invalid form data
- [ ] Test network errors
- [ ] Verify error messages display appropriately

## Database Verification
- [ ] Check Supabase dashboard:
  - Events table populated correctly
  - Bookings table has client relationships
  - RLS policies active and working
  - User IDs correctly associated with records

## Performance Checks
- [ ] Page load times under 2 seconds
- [ ] No console errors in browser dev tools
- [ ] Calendar interactions smooth and responsive
- [ ] Table operations (sort/filter) performant

## Accessibility
- [ ] Keyboard navigation works for forms
- [ ] Screen reader compatibility for table data
- [ ] Focus states visible on interactive elements

## Success Criteria
All test cases pass with:
- ✅ No console errors
- ✅ All CRUD operations work correctly  
- ✅ Navigation flows properly
- ✅ RLS security enforced
- ✅ UI responsive and accessible
- ✅ Data persistence confirmed

## Notes
- Report any bugs or issues in separate document
- Include screenshots for UI/UX feedback  
- Document any performance issues
- Note browser compatibility problems