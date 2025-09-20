#!/bin/bash

# Comprehensive test runner for Round 9 fixes verification
echo "🚀 Running Round 9 Fixes Verification Tests"
echo "============================================"

# Set exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run test with error handling
run_test() {
    local test_file=$1
    local test_name=$2

    echo -e "\n${YELLOW}📋 Running: $test_name${NC}"
    echo "----------------------------------------"

    if npx playwright test "$test_file" --reporter=line; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        return 1
    fi
}

# Initialize results
passed_tests=0
failed_tests=0
total_tests=5

echo "Starting test execution..."

# Test 1: Select Infinite Loop Prevention
if run_test "tests/e2e/select-loop.spec.ts" "Select Infinite Loop Prevention"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi

# Test 2: Bookings Date, Color and Cancellation
if run_test "tests/e2e/bookings-date-color-cancel.spec.ts" "Bookings Date, Color and Cancellation"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi

# Test 3: Title and Slug UX
if run_test "tests/e2e/title-slug.spec.ts" "Title and Slug UX"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi

# Test 4: Availability New Block and Toggle
if run_test "tests/e2e/availability-new-toggle.spec.ts" "Availability New Block and Toggle"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi

# Test 5: Categories CRUD and Filtering
if run_test "tests/e2e/categories.spec.ts" "Categories CRUD and Filtering"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi

# Summary
echo -e "\n🏁 TEST SUMMARY"
echo "================"
echo -e "Total Tests: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Round 9 fixes are working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the failures above.${NC}"
    exit 1
fi
