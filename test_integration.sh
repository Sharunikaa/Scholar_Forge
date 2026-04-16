#!/bin/bash

# ArXivIQ Frontend-Backend Integration Test Suite
# Tests all dashboard pages and API integrations

echo "=========================================="
echo "ArXivIQ Dashboard Integration Test Suite"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

declare -i passed=0
declare -i failed=0

test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_field="$3"
  
  echo -n "Testing: $name ... "
  
  response=$(curl -s "$url")
  
  if echo "$response" | grep -q "$expected_field"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Response: $response"
    ((failed++))
  fi
}

echo -e "${BLUE}=== Backend API Tests ===${NC}"
echo ""

# Test health endpoint
test_endpoint "Health Check" \
  "http://localhost:8000/health" \
  "healthy"

# Test sessions list
test_endpoint "List Sessions" \
  "http://localhost:8000/api/sessions?user_id=test_user" \
  "id"

# Test analytics
test_endpoint "Analytics Data" \
  "http://localhost:8000/api/analytics" \
  "total_sessions"

# Test settings
test_endpoint "User Settings" \
  "http://localhost:8000/api/settings" \
  "language"

echo ""
echo -e "${BLUE}=== Frontend Proxy Tests ===${NC}"
echo ""

# Test proxy forwarding
test_endpoint "Proxy: Sessions via Frontend" \
  "http://localhost:5173/api/sessions?user_id=test_user" \
  "id"

test_endpoint "Proxy: Analytics via Frontend" \
  "http://localhost:5173/api/analytics" \
  "total_sessions"

test_endpoint "Proxy: Settings via Frontend" \
  "http://localhost:5173/api/settings" \
  "language"

echo ""
echo -e "${BLUE}=== Database Integration Tests ===${NC}"
echo ""

# Create a test session
echo -n "Creating test session ... "
SESSION=$(curl -s -X POST http://localhost:8000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test_suite","name":"Test Session '$(date +%s)'"}')

SESSION_ID=$(echo "$SESSION" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SESSION_ID" ]; then
  echo -e "${GREEN}✅ PASS${NC} (ID: $SESSION_ID)"
  ((passed++))
else
  echo -e "${RED}❌ FAIL${NC}"
  ((failed++))
fi

# Create a test query
if [ -n "$SESSION_ID" ]; then
  echo -n "Creating test query ... "
  QUERY=$(curl -s -X POST http://localhost:8000/api/queries \
    -H "Content-Type: application/json" \
    -d "{\"session_id\":\"$SESSION_ID\",\"question\":\"Test query\",\"language\":\"en\",\"citation_style\":\"apa\"}")
  
  QUERY_ID=$(echo "$QUERY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$QUERY_ID" ]; then
    echo -e "${GREEN}✅ PASS${NC} (ID: $QUERY_ID)"
    ((passed++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed++))
  fi
fi

# Verify session has query
if [ -n "$SESSION_ID" ]; then
  echo -n "Verify query added to session ... "
  SESSION_DETAIL=$(curl -s "http://localhost:8000/api/sessions/$SESSION_ID")
  
  if echo "$SESSION_DETAIL" | grep -q "1"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((passed++))
  else
    echo -e "${RED}❌ FAIL${NC}"
    ((failed++))
  fi
fi

echo ""
echo -e "${BLUE}=== Frontend Page Tests ===${NC}"
echo ""

# Test frontend pages load
test_endpoint "Frontend Home Page" \
  "http://localhost:5173/" \
  "What do you want to research"

echo ""
echo -e "${BLUE}=== Results ===${NC}"
echo ""
echo -e "Passed: ${GREEN}$passed${NC}"
echo -e "Failed: ${RED}$failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed! Frontend-Backend integration is working correctly.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Check the integration.${NC}"
  exit 1
fi
