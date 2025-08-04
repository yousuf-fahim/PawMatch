#!/bin/bash

echo "🧪 PawMatch System Integration Test"
echo "=================================="
echo ""

# Test 1: Admin Panel Status
echo "🔧 Testing Admin Panel..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/login)
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Admin Panel: Running (HTTP $ADMIN_STATUS)"
else
    echo "❌ Admin Panel: Not accessible (HTTP $ADMIN_STATUS)"
fi

# Test 2: React Native App Status  
echo "🔧 Testing React Native App..."
APP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081)
if [ "$APP_STATUS" = "200" ]; then
    echo "✅ React Native App: Running (HTTP $APP_STATUS)"
else
    echo "❌ React Native App: Not accessible (HTTP $APP_STATUS)"
fi

# Test 3: Database Connectivity
echo "🔧 Testing Database..."
DB_TEST=$(curl -s "https://afxkliyukojjymvfwiyp.supabase.co/rest/v1/pets?select=id&limit=1" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeGtsaXl1a29qanltdmZ3aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjc1NTcsImV4cCI6MjA2OTc0MzU1N30.tAn3GDt39F4xVMubXBpgYKEXh9eleIQzGg6SmEucAdc" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeGtsaXl1a29qanltdmZ3aXlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjc1NTcsImV4cCI6MjA2OTc0MzU1N30.tAn3GDt39F4xVMubXBpgYKEXh9eleIQzGg6SmEucAdc")

if echo "$DB_TEST" | grep -q "id"; then
    echo "✅ Database: Connected and responsive"
else
    echo "❌ Database: Connection failed"
fi

# Test 4: API Security
echo "🔧 Testing API Security..."
API_SECURITY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/pets)
if [ "$API_SECURITY" = "401" ]; then
    echo "✅ API Security: Properly rejecting unauthorized requests"
else
    echo "⚠️ API Security: Unexpected response (HTTP $API_SECURITY)"
fi

echo ""
echo "📊 System Status Summary:"
echo "========================"
echo "🖥️  Admin Panel (localhost:3000): $( [ "$ADMIN_STATUS" = "200" ] && echo "ONLINE ✅" || echo "OFFLINE ❌" )"
echo "📱 React Native App (localhost:8081): $( [ "$APP_STATUS" = "200" ] && echo "ONLINE ✅" || echo "OFFLINE ❌" )"
echo "🗄️  Database: $( echo "$DB_TEST" | grep -q "id" && echo "CONNECTED ✅" || echo "DISCONNECTED ❌" )"
echo "🔒 API Security: $( [ "$API_SECURITY" = "401" ] && echo "SECURED ✅" || echo "UNSECURED ⚠️" )"

echo ""
echo "🎯 Integration Test Complete!"

# Count passed tests
PASSED=0
[ "$ADMIN_STATUS" = "200" ] && ((PASSED++))
[ "$APP_STATUS" = "200" ] && ((PASSED++))
echo "$DB_TEST" | grep -q "id" && ((PASSED++))
[ "$API_SECURITY" = "401" ] && ((PASSED++))

echo "Results: $PASSED/4 tests passed"

if [ $PASSED -eq 4 ]; then
    echo "🎉 ALL SYSTEMS OPERATIONAL!"
    exit 0
else
    echo "⚠️  Some systems need attention"
    exit 1
fi
