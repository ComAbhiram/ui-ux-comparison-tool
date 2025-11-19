# Ngrok Setup Guide - Share QA Bugtracking Tool Over Internet

## 🌐 Share Your Application with Project Manager Remotely

This guide helps you expose your local QA Bugtracking Tool to the internet so your project manager can access it from anywhere.

---

## Option 1: Ngrok (Recommended - Easiest)

### Step 1: Install Ngrok

#### Method A: Using Homebrew (Easiest for macOS)
```bash
# Install ngrok via Homebrew
brew install ngrok/ngrok/ngrok
```

#### Method B: Manual Download
1. Visit: https://ngrok.com/download
2. Download macOS version
3. Unzip and move to /usr/local/bin:
   ```bash
   unzip ~/Downloads/ngrok-v3-stable-darwin-amd64.zip
   sudo mv ngrok /usr/local/bin/
   ```

### Step 2: Sign Up & Get Auth Token (Required)
1. Create free account: https://dashboard.ngrok.com/signup
2. Get your auth token: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
   ```

### Step 3: Start Your Servers

```bash
# Terminal 1: Start Backend
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/backend"
node src/server.js

# Terminal 2: Start Frontend  
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"
npm run dev
```

### Step 4: Expose Frontend with Ngrok

```bash
# Terminal 3: Tunnel Frontend (port 5173)
ngrok http 5173
```

**You'll see output like:**
```
ngrok                                                                    
                                                                          
Session Status                online                                     
Account                       your-email@example.com (Plan: Free)        
Version                       3.x.x                                      
Region                        United States (us)                         
Latency                       -                                          
Web Interface                 http://127.0.0.1:4040                      
Forwarding                    https://abc123xyz.ngrok.io -> http://localhost:5173

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### Step 5: Update API Configuration

**Important:** Your frontend will try to connect to localhost:5000 for the backend, but that won't work over the internet.

You need to also expose the backend:

```bash
# Terminal 4: Tunnel Backend (port 5000)
ngrok http 5000
```

**You'll get another URL like:**
```
Forwarding                    https://xyz789abc.ngrok.io -> http://localhost:5000
```

### Step 6: Configure Frontend to Use Ngrok Backend

Edit: `src/config/api.ts`

```typescript
// Change from:
const API_BASE_URL = 'http://localhost:5000/api';

// To your ngrok backend URL:
const API_BASE_URL = 'https://xyz789abc.ngrok.io/api';
```

**Or use environment variable:**

Create `.env` file in root:
```bash
VITE_API_BASE_URL=https://xyz789abc.ngrok.io/api
```

Then update `src/config/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```

### Step 7: Restart Frontend

```bash
# Stop Vite (Ctrl+C) and restart
npm run dev
```

### Step 8: Share URLs with Project Manager

**Send this information to Saneesh:**

---

📧 **Email to Project Manager:**

```
Subject: QA Bugtracking Tool - Live Demo Access

Dear Saneesh,

The QA Bugtracking Tool is now live and accessible for your review.

🔗 **Access URL:** https://abc123xyz.ngrok.io

📝 **Demo Login Credentials:**
- Email: admin@example.com
- Password: admin123

⏰ **Available:** This link will be active for the next [2 hours / until end of day]

📱 **Access:** Works on any device (desktop, mobile, tablet)

Please explore the following features:
1. Dashboard with real-time metrics
2. Project management and tracking
3. Issue/Bug reporting with auto-generated IDs
4. User management (Admin panel)
5. Activity audit logs
6. Kanban board view

Let me know if you have any questions or would like a guided walkthrough.

Best Regards,
Abhiram P Mohan
Lead QA Analyst
```

---

## Important Notes

### ⚠️ Ngrok Free Tier Limitations:
- **Session expires after 2 hours** (need to restart)
- **Random URL each time** (URL changes on restart)
- **Limited to 1 process** (upgrade for multiple tunnels)
- **60 connections/minute** rate limit

### 🔒 Security Considerations:
1. **Don't use production database** - Use demo data only
2. **Change default passwords** before sharing
3. **Monitor access** via ngrok dashboard: http://127.0.0.1:4040
4. **Shut down after demo** - Don't leave running permanently
5. **Use temporary test data** - Real company data should not be exposed

### 📊 Monitor Traffic:
Visit ngrok web interface while tunnel is running:
```
http://127.0.0.1:4040
```
You can see all HTTP requests in real-time!

---

## Option 2: Alternative Tunneling Tools

### LocalTunnel (No signup required)
```bash
# Install
npm install -g localtunnel

# Expose frontend
lt --port 5173

# Expose backend
lt --port 5000
```

**Pros:** No account needed, free
**Cons:** Less stable, slower, random URLs

### Cloudflare Tunnel (Free, More Secure)
```bash
# Install
brew install cloudflare/cloudflare/cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:5173
```

**Pros:** Free, stable, Cloudflare security
**Cons:** Slightly more complex setup

### Tailscale (VPN Approach)
Best if project manager can install software on their machine.
- More secure
- Faster
- No public exposure

---

## Quick Setup Script

Save as `start-demo.sh`:

```bash
#!/bin/bash

echo "🚀 Starting QA Bugtracking Tool Demo..."

# Start backend in background
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/backend"
echo "📡 Starting backend server..."
node src/server.js > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend
sleep 3

# Start frontend in background
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"
echo "🎨 Starting frontend server..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend
sleep 5

# Start ngrok tunnels
echo "🌐 Starting ngrok tunnels..."
echo ""
echo "⚠️  IMPORTANT: Start ngrok manually in separate terminals:"
echo ""
echo "Terminal 1: ngrok http 5000  (Backend)"
echo "Terminal 2: ngrok http 5173  (Frontend)"
echo ""
echo "Then update frontend API config with backend ngrok URL"
echo ""
echo "To stop servers:"
echo "kill $BACKEND_PID $FRONTEND_PID"
```

Make executable:
```bash
chmod +x start-demo.sh
./start-demo.sh
```

---

## Troubleshooting

### Issue 1: "ngrok not found"
**Solution:** Reinstall or add to PATH
```bash
export PATH="/usr/local/bin:$PATH"
```

### Issue 2: "Authentication required"
**Solution:** Add your auth token
```bash
ngrok config add-authtoken YOUR_TOKEN
```

### Issue 3: Frontend can't reach backend
**Solution:** 
1. Check CORS settings in backend
2. Verify API_BASE_URL points to ngrok backend URL
3. Restart frontend after changing config

### Issue 4: "Too Many Connections"
**Solution:** Ngrok free tier limit reached
- Wait 1 minute
- Or upgrade to paid plan
- Or use alternative tool

### Issue 5: Tunnel keeps disconnecting
**Solution:**
- Check internet connection
- Ngrok free sessions expire after 2 hours
- Restart tunnel with same command

---

## Backend CORS Configuration

Ensure your backend accepts ngrok URLs:

Edit: `backend/src/server.js`

```javascript
// Add ngrok URLs to CORS whitelist
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.ngrok\.io$/,           // Allow all ngrok URLs
    /\.ngrok-free\.app$/      // New ngrok domain
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

---

## Step-by-Step Checklist

- [ ] Install ngrok: `brew install ngrok/ngrok/ngrok`
- [ ] Create ngrok account and get auth token
- [ ] Configure ngrok: `ngrok config add-authtoken TOKEN`
- [ ] Start backend: `node src/server.js`
- [ ] Start frontend: `npm run dev`
- [ ] Tunnel backend: `ngrok http 5000`
- [ ] Tunnel frontend: `ngrok http 5173`
- [ ] Update frontend API config with backend ngrok URL
- [ ] Restart frontend
- [ ] Test access from different device/network
- [ ] Send URLs to project manager
- [ ] Monitor traffic at http://127.0.0.1:4040
- [ ] Shut down after demo

---

## Recommended: Paid Ngrok Plan for Professional Demo

**Benefits:**
- Custom subdomain (yourcompany.ngrok.io)
- Persistent URLs (don't change)
- No 2-hour timeout
- Multiple simultaneous tunnels
- Better performance

**Cost:** $8/month (Basic plan)

**Worth it if:**
- Multiple demos scheduled
- Want professional appearance
- Need reliable access for project manager

---

## Alternative: Deploy to Cloud (More Permanent)

If you need longer-term access or want to avoid tunnel limitations:

### 1. **Free Hosting Options:**
- **Frontend:** Vercel, Netlify (free tier)
- **Backend:** Railway, Render (free tier)
- **Database:** PostgreSQL on Railway/Render

### 2. **Deploy Time:** 30-60 minutes setup

### 3. **Benefits:**
- Permanent URLs
- No tunneling needed
- More professional
- Better performance

**Let me know if you want deployment guide for any of these!**

---

## Demo Preparation Tips

Before sharing with project manager:

1. ✅ **Clean up demo data**
   - Add realistic project names
   - Create sample bugs with professional descriptions
   - Use real-looking user names

2. ✅ **Test on mobile device**
   - Responsive design check
   - Touch interactions work

3. ✅ **Prepare talking points**
   - Walk through each feature
   - Have comparison points vs GitLab ready
   - Practice demo flow (5-10 minutes)

4. ✅ **Have backup plan**
   - Take screenshots (as per SCREENSHOTS_GUIDE.md)
   - Record screen video
   - Prepare offline demo on your laptop

5. ✅ **Monitor during demo**
   - Keep ngrok web interface open (localhost:4040)
   - Watch for errors in browser console
   - Have terminals visible to restart if needed

---

## Quick Commands Reference

```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Configure auth
ngrok config add-authtoken YOUR_TOKEN

# Start tunnels
ngrok http 5173  # Frontend
ngrok http 5000  # Backend

# Check ngrok status
curl http://127.0.0.1:4040/api/tunnels

# Stop ngrok
pkill ngrok
```

---

## Security Reminder

🔐 **After Demo:**
1. Stop all ngrok tunnels (`pkill ngrok`)
2. Stop backend server
3. Stop frontend server
4. Revoke demo credentials if needed
5. Clear any sensitive test data

---

**Ready to share! Good luck with your presentation! 🚀**

For questions: abhiram@intersmart.in
