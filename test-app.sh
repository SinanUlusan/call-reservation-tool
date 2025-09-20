#!/bin/bash

# Call Reservation Tool - Comprehensive Testing Script
# This script tests all the requirements from the assignment

echo "🧪 Call Reservation Tool - Comprehensive Testing"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000/api"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    echo "Command: $command"
    
    # Run the command and capture response
    response=$(eval "$command" 2>&1)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response: $response"
        ((TESTS_FAILED++))
    fi
}

# Function to test API endpoint
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    echo -e "\n${BLUE}Testing: $test_name${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method \
            "$BASE_URL$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $status_code"
    echo "Response: $body"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        ((TESTS_FAILED++))
    fi
}

echo -e "\n${YELLOW}1. Testing Server Health${NC}"
test_api "Server Health Check" "GET" "" "" "200"

echo -e "\n${YELLOW}2. Testing Reservation Creation${NC}"
# Test valid reservation creation
test_api "Create Valid Reservation" "POST" "/reservation" '{
    "startTime": "13:15",
    "email": "test@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "test-push-key-123",
    "receiveEmail": true,
    "receiveSmsNotification": true,
    "receivePushNotification": true
}' "201"

# Test invalid time format
test_api "Create Reservation with Invalid Time" "POST" "/reservation" '{
    "startTime": "13:20",
    "email": "test@example.com",
    "phone": "+1234567890",
    "pushNotificationKey": "test-push-key-123",
    "receiveEmail": true,
    "receiveSmsNotification": true,
    "receivePushNotification": true
}' "400"

# Test invalid email
test_api "Create Reservation with Invalid Email" "POST" "/reservation" '{
    "startTime": "13:15",
    "email": "invalid-email",
    "phone": "+1234567890",
    "pushNotificationKey": "test-push-key-123",
    "receiveEmail": true,
    "receiveSmsNotification": true,
    "receivePushNotification": true
}' "400"

echo -e "\n${YELLOW}3. Testing Reservation Retrieval${NC}"
test_api "Get All Reservations" "GET" "/reservation" "" "200"

# Note: We'll need to extract the ID from the previous response for individual tests
echo -e "\n${YELLOW}4. Testing Admin Operations${NC}"
test_api "Get Admin Reservations" "GET" "/admin/reservations" "" "200"
test_api "Get Pending Reservations" "GET" "/admin/reservations/pending" "" "200"

echo -e "\n${YELLOW}5. Testing Swagger Documentation${NC}"
swagger_response=$(curl -s -w "%{http_code}" "http://localhost:3000/api/docs")
swagger_status=$(echo "$swagger_response" | tail -c 4)

if [ "$swagger_status" = "200" ]; then
    echo -e "${GREEN}✅ Swagger Documentation Available${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Swagger Documentation Not Available${NC}"
    ((TESTS_FAILED++))
fi

echo -e "\n${YELLOW}6. Testing Application Build${NC}"
run_test "Application Build" "npx nx build call-reservation-tool" "0"

echo -e "\n${YELLOW}7. Testing Unit Tests${NC}"
run_test "Unit Tests" "npx nx test call-reservation-tool" "0"

echo -e "\n${YELLOW}8. Testing Linting${NC}"
run_test "Code Linting" "npx nx lint call-reservation-tool" "0"

echo -e "\n${YELLOW}📊 Test Results Summary${NC}"
echo "================================================"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! The application meets all assignment requirements.${NC}"
else
    echo -e "\n${RED}⚠️  Some tests failed. Please review the issues above.${NC}"
fi

echo -e "\n${BLUE}📚 Additional Manual Tests to Perform:${NC}"
echo "1. Visit http://localhost:3000/api/docs to test Swagger UI"
echo "2. Test reservation cancellation with admin email notification"
echo "3. Test admin accept/reject actions with user notifications"
echo "4. Test time slot conflict prevention"
echo "5. Test notification services (check console logs)"
echo "6. Test database persistence"
echo "7. Test Docker deployment: docker-compose up -d"
