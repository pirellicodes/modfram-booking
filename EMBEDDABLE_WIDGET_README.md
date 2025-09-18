# ModFram Embeddable Booking Widget

An in-house embeddable appointment calendar that mirrors Cal.com's style and flow, but runs entirely on your stack with no external dependencies.

## ✅ Implementation Complete

The embeddable booking widget has been fully implemented with the following features:

### 🎯 Cal.com-style UX Parity
- ✅ Clean, minimal UI with large date picker + time-slot panel
- ✅ Clear stepper flow: **Session Type → Date/Time → Details → Confirm**
- ✅ Auto-detected timezone with selector; times render in viewer's timezone
- ✅ Slot grid with "Today/Next/Prev" controls, disabled past/blocked slots
- ✅ Form fields: name, email, phone, notes with validation + helpful errors
- ✅ Review screen with summary; confirmation page with success state
- ✅ Keyboard accessible, screen-reader friendly, responsive/mobile-first
- ✅ Light/dark themes matching the app; Cal.com-inspired spacing/typography

### 🌐 Routes
- ✅ Public full page: `/schedule/[slug]`
- ✅ Public embed view (no chrome): `/schedule/[slug]/embed`

### 🔧 Embed Options

#### 1. Iframe Embed
```html
<iframe
  src="https://YOUR_DOMAIN/schedule/{slug}/embed"
  style="width:100%;min-height:780px;border:0;border-radius:8px;"
  loading="lazy"
  allow="clipboard-write *"
  title="Book a Session"
></iframe>
```

#### 2. JavaScript Widget (Recommended)
```html
<script async src="https://YOUR_DOMAIN/widget.js"
        data-schedule-url="https://YOUR_DOMAIN/schedule/{slug}/embed"
        data-width="100%"
        data-height="auto"
        data-theme="auto">
</script>
```

**Features:**
- Auto-resize based on content
- Theme detection (light/dark/auto)
- Loading states and error handling
- Retry mechanism for network issues
- Responsive design

### 🔒 Security & Performance
- ✅ **Service-role authentication** for public booking API
- ✅ **Rate limiting** (IP + slug based)
- ✅ **Input validation** and sanitization
- ✅ **Race condition prevention** for double-booking
- ✅ **Sandboxed iframe** with restricted permissions
- ✅ **CORS support** for cross-origin embedding

### 📊 Data Flow
- ✅ **POST `/api/public/bookings`** (server-only; uses Supabase service role)
- ✅ **GET `/api/public/availability`** for fetching available time slots
- ✅ Resolves `{slug} -> user_id` and verifies slot availability
- ✅ Never exposes service key client-side; maintains strict RLS

## 🚀 Quick Start

### 1. Setup Event Types
1. Create session types in admin panel with unique slugs
2. Configure availability in settings
3. Test the booking flow

### 2. Get Your Embed URLs
- Full page: `https://YOUR_DOMAIN/schedule/{slug}`
- Embed page: `https://YOUR_DOMAIN/schedule/{slug}/embed`
- Widget script: `https://YOUR_DOMAIN/widget.js`

### 3. Embed on Your Website

Choose your preferred method:

**Simple Iframe:**
```html
<iframe
  src="https://YOUR_DOMAIN/schedule/demo-session/embed"
  style="width:100%;min-height:780px;border:0;"
  loading="lazy"
  allow="clipboard-write *"
></iframe>
```

**Smart Widget (Auto-resize):**
```html
<script async src="https://YOUR_DOMAIN/widget.js"
        data-schedule-url="https://YOUR_DOMAIN/schedule/demo-session/embed">
</script>
```

**Popup/Modal Integration:**
```html
<button onclick="openBookingModal()">Book a Session</button>
<div id="booking-modal" style="display:none;">
  <!-- Modal with iframe -->
</div>
```

## 🛠 Configuration Options

### Widget Data Attributes
- `data-schedule-url` (required): URL to your embed page
- `data-width` (optional): Widget width (default: "100%")
- `data-height` (optional): Widget height (default: "auto")
- `data-theme` (optional): "light", "dark", or "auto" (default: "auto")

### Programmatic API
```javascript
// Create widget programmatically
const widgetId = ModFramWidget.create('#container', scheduleUrl, {
  width: '800px',
  height: 'auto',
  theme: 'light'
});

// Destroy widget
ModFramWidget.destroy(widgetId);
```

## 🎨 Styling & Customization

### CSS Customization
```css
.modfram-booking-widget {
  border: 2px solid #3b82f6;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
```

### Theme Support
- **Auto**: Detects system preference
- **Light**: Clean white background
- **Dark**: Dark theme matching your app

## 🔧 Technical Details

### Components Architecture
```
📁 src/components/booking/
├── BookingWidget.tsx        # Main orchestrator component
├── SessionTypeSelect.tsx    # Step 1: Choose session type
├── CalendarPicker.tsx       # Step 2: Date & time selection
├── ClientForm.tsx           # Step 3: Contact information
├── ReviewConfirm.tsx        # Step 4: Review & confirm
└── SuccessPage.tsx          # Success state & instructions
```

### API Endpoints
```
📁 src/app/api/public/
├── bookings/route.ts        # POST: Create booking (service-role)
└── availability/route.ts    # GET: Fetch available slots
```

### Key Features
- **Timezone-aware** slot generation
- **Conflict prevention** with double-booking checks
- **Responsive design** for mobile/desktop
- **Accessibility** compliant (WCAG 2.1)
- **Loading states** and error handling
- **Form validation** with helpful messages

## 📚 Examples

See `examples/embed-example.html` for comprehensive examples including:
- Basic iframe embedding
- JavaScript widget usage
- Custom styling options
- Popup/modal integration
- Configuration reference

## 🧪 Testing

### Self-Validation Checklist
- [x] Create a session type + availability in admin
- [x] Visit `/schedule/{slug}`: choose session, pick slot, submit
- [x] Booking appears in admin panel
- [x] Test iframe embed on external HTML page (auto-resizes, themed)
- [x] Try double-book race condition: second attempt blocked
- [x] `npm run build` passes successfully
- [x] All TypeScript compilation successful

### End-to-End Flow
1. **Admin Setup**: Create event type with slug, set availability
2. **Public Access**: Visit `/schedule/{slug}` or embed
3. **Booking Flow**: Complete 4-step wizard
4. **Confirmation**: Success page with calendar integration
5. **Admin Sync**: Booking appears in admin dashboard

## 🔐 Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🎯 Next Steps

The embeddable widget is production-ready! You can now:

1. **Deploy to production** with the required environment variables
2. **Share embed codes** with clients for their websites
3. **Monitor bookings** through the admin dashboard
4. **Customize styling** to match brand requirements
5. **Add webhooks** for external integrations (if needed)

The implementation successfully replicates Cal.com's user experience while running entirely on your own infrastructure with full control over data and customization.