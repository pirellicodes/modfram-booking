# External Integration Setup

This document details the external service configurations required for the booking platform.

## Current Status

### Completed
- Supabase database and auth
- shadcn/ui component system
- Basic Next.js app structure

### 🔄 In Progress
- Hydration mismatch fixes
- API data shape alignment
- Event title input controls

### Pending Setup

## Google Calendar Integration

**Purpose**: Sync bookings with user's Google Calendar

**Setup Required**:
1. Create Google Cloud Project
2. Enable Calendar API
3. Create OAuth 2.0 credentials
4. Configure redirect URI: `/api/google/oauth/callback`

**Environment Variables**:
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_OAUTH_REDIRECT_URL=https://your-domain.com/api/google/oauth/callback
GOOGLE_OAUTH_STATE_SECRET=random_secure_string
