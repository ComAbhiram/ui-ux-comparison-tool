#!/bin/bash

# QA Bugtracking Tool - Ngrok Setup Script
# This script helps you share your application over the internet

echo "🚀 QA Bugtracking Tool - Internet Sharing Setup"
echo "================================================"
echo ""

# Step 1: Check if ngrok is authenticated
echo "📋 Step 1: Ngrok Authentication Check"
echo "--------------------------------------"
if ! ngrok config check &>/dev/null; then
    echo "⚠️  Ngrok not authenticated!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Visit: https://dashboard.ngrok.com/signup"
    echo "2. Sign up (free) and get your auth token"
    echo "3. Run: ngrok config add-authtoken YOUR_TOKEN_HERE"
    echo ""
    echo "After authentication, run this script again."
    exit 1
else
    echo "✅ Ngrok is authenticated and ready!"
fi

echo ""
echo "📋 Step 2: Server Status"
echo "------------------------"

# Check backend
if lsof -i :5000 | grep LISTEN &>/dev/null; then
    echo "✅ Backend running on port 5000"
else
    echo "❌ Backend NOT running!"
    echo "   Starting backend..."
    cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/backend"
    nohup node src/server.js > /dev/null 2>&1 &
    sleep 3
    if lsof -i :5000 | grep LISTEN &>/dev/null; then
        echo "✅ Backend started successfully"
    else
        echo "❌ Failed to start backend"
        exit 1
    fi
fi

# Check frontend
if lsof -i :5173 | grep LISTEN &>/dev/null; then
    echo "✅ Frontend running on port 5173"
else
    echo "⚠️  Frontend NOT running on port 5173"
    echo "   Please start frontend manually:"
    echo "   cd '/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool'"
    echo "   npm run dev"
    echo ""
fi

echo ""
echo "📋 Step 3: Starting Ngrok Tunnels"
echo "----------------------------------"
echo ""
echo "⚠️  IMPORTANT: You need to run TWO tunnels in separate terminals:"
echo ""
echo "🔹 Terminal 1 (Backend Tunnel):"
echo "   ngrok http 5000"
echo ""
echo "🔹 Terminal 2 (Frontend Tunnel):"
echo "   ngrok http 5173"
echo ""
echo "📝 After starting both tunnels:"
echo ""
echo "1. Copy the BACKEND ngrok URL (looks like: https://xyz123.ngrok.io)"
echo ""
echo "2. Update your .env file:"
echo "   Open: /Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/.env"
echo "   Change: VITE_API_BASE_URL=https://YOUR_BACKEND_NGROK_URL/api"
echo ""
echo "3. Restart frontend (Ctrl+C and npm run dev again)"
echo ""
echo "4. Share the FRONTEND ngrok URL with your project manager"
echo ""
echo "📧 Email Template:"
echo "=================="
echo ""
echo "Dear Saneesh,"
echo ""
echo "The QA Bugtracking Tool is now accessible at:"
echo "🔗 https://YOUR_FRONTEND_NGROK_URL"
echo ""
echo "Login Credentials:"
echo "📧 Email: admin@example.com"
echo "🔑 Password: admin123"
echo ""
echo "⏰ This link will be active for the next 2 hours (free ngrok tier)"
echo ""
echo "Best Regards,"
echo "Abhiram P Mohan"
echo ""
echo "================================================"
echo ""
echo "🎯 Quick Commands:"
echo ""
echo "Start Backend Tunnel:  ngrok http 5000"
echo "Start Frontend Tunnel: ngrok http 5173"
echo "View Tunnels Dashboard: http://localhost:4040"
echo ""
echo "💡 Tip: Keep the ngrok dashboard open to monitor traffic!"
echo ""
