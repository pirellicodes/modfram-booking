#!/usr/bin/env node

// Sentry Logging Test Script
// This script tests all the Sentry structured logging functionality

console.log('🔍 SENTRY LOGGING TEST SUITE');
console.log('============================\n');

const baseUrl = 'http://localhost:3000';

async function testEndpoint(method, endpoint, data = null, description) {
  console.log(`🧪 Testing: ${description}`);
  console.log(`   ${method} ${endpoint}`);

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const result = await response.text();

    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${result}`);
    console.log('   ✅ Request completed\n');

    return { status: response.status, body: result };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('Starting Sentry logging tests...\n');

  // Test 1: GET request with query parameters (should log "Fetching bookings")
  await testEndpoint(
    'GET',
    '/api/bookings?start=2024-01-01&end=2024-12-31',
    null,
    'GET /api/bookings with date range - Should log "Fetching bookings" with hasStartParam=true, hasEndParam=true'
  );

  // Test 2: GET request without parameters
  await testEndpoint(
    'GET',
    '/api/bookings',
    null,
    'GET /api/bookings without parameters - Should log "Fetching bookings" with hasStartParam=false, hasEndParam=false'
  );

  // Test 3: POST request (should log "Creating new booking")
  await testEndpoint(
    'POST',
    '/api/bookings',
    {
      client_name: 'Test Client for Sentry',
      booking_date: '2024-01-15',
      booking_time: '14:30:00',
      client_email: 'sentry-test@example.com',
      notes: 'This is a test booking for Sentry logging'
    },
    'POST /api/bookings - Should log "Creating new booking" and error due to authentication'
  );

  // Test 4: PUT request (should log "Updating booking")
  await testEndpoint(
    'PUT',
    '/api/bookings?id=test-booking-123',
    {
      client_name: 'Updated Test Client',
      status: 'confirmed'
    },
    'PUT /api/bookings with ID - Should log "Updating booking" with bookingId'
  );

  // Test 5: DELETE request without ID (should log error)
  await testEndpoint(
    'DELETE',
    '/api/bookings',
    null,
    'DELETE /api/bookings without ID - Should log error "Booking ID required"'
  );

  // Test 6: DELETE request with ID (should log "Deleting booking")
  await testEndpoint(
    'DELETE',
    '/api/bookings?id=test-booking-456',
    null,
    'DELETE /api/bookings with ID - Should log "Deleting booking" with bookingId'
  );

  console.log('🎉 All tests completed!');
  console.log('\n📊 EXPECTED SENTRY LOGS:');
  console.log('========================');
  console.log('• "Fetching bookings" logs with hasStartParam/hasEndParam context');
  console.log('• "Creating new booking" log');
  console.log('• "Updating booking" log with bookingId context');
  console.log('• "Deleting booking" log with bookingId context');
  console.log('• Multiple "Failed to..." error logs with error details and stack traces');
  console.log('\n✨ Check your Sentry dashboard for these structured logs!');
}

// Run the tests
runTests().catch(console.error);
