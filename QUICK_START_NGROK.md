# 🌐 NGROK QUICK START GUIDE

## ✅ Everything is Ready!

Your QA Bugtracking Tool is configured and ready to share over the internet.

---

## 🚀 STEP 1: Authenticate Ngrok (One-time setup)

1. **Sign up for free ngrok account:**
   - Visit: https://dashboard.ngrok.com/signup
   - Sign up with your email

2. **Get your auth token:**
   - After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your auth token

3. **Configure ngrok:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
   ```

---

## 🔥 STEP 2: Start Ngrok Tunnels

You need to open **TWO new terminal windows** and run these commands:

### Terminal Window 1 - Backend Tunnel:
```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding    https://abc123xyz.ngrok.io -> http://localhost:5000
```

**📝 COPY this backend URL!** You'll need it in the next step.

---

### Terminal Window 2 - Frontend Tunnel:
```bash
ngrok http 5173
```

You'll see output like:
```
Forwarding    https://def456ghi.ngrok.io -> http://localhost:5173
```

**📝 COPY this frontend URL!** This is what you'll share with your project manager.

---

## ⚙️ STEP 3: Update Frontend Configuration

1. **Open the .env file:**
   ```bash
   code "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/.env"
   ```
   
   Or manually edit:
   `/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/.env`

2. **Update the API URL:**
   Change this line:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   
   To your **backend ngrok URL**:
   ```
   VITE_API_BASE_URL=https://abc123xyz.ngrok.io/api
   ```
   
   ⚠️ **Important:** Add `/api` at the end!

3. **Save the file**

---

## 🔄 STEP 4: Restart Frontend

The frontend is already running, but you need to restart it to load the new configuration:

1. **Find the terminal running Vite** (it shows "VITE ready")

2. **Press `Ctrl+C`** to stop it

3. **Restart frontend:**
   ```bash
   cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"
   npm run dev
   ```

---

## 📧 STEP 5: Share with Project Manager

**Copy this email template and fill in your ngrok URLs:**

---

**Subject:** QA Bugtracking Tool - Live Demo Access

Dear Saneesh,

I hope this email finds you well.

The QA Bugtracking Tool is now live and accessible for your review:

**🔗 Access URL:** https://def456ghi.ngrok.io _(your frontend ngrok URL)_

**📝 Login Credentials:**
- **Email:** admin@example.com
- **Password:** admin123

**⏰ Availability:** This demo link will be active for the next 2 hours (please let me know if you need more time, and I can extend it).

**📱 Compatible with:** Desktop, Mobile, and Tablet browsers

**Key Features to Explore:**
1. **Dashboard** - Real-time metrics and project overview
2. **Project Management** - Track multiple projects with progress indicators
3. **Bug Tracking** - Auto-generated Bug IDs (BUG-XXXX format)
4. **Issue Management** - Severity levels, status workflow, assignments
5. **User Management** - Role-based access control (Admin/QA/Developer)
6. **Activity Logs** - Complete audit trail of all actions
7. **Kanban Board** - Visual workflow management

Please feel free to explore all features. If you would like a guided walkthrough or have any questions, I'm available for a quick call.

I've also attached screenshots highlighting the key features for your reference.

Looking forward to your feedback!

Best Regards,  
**Abhiram P Mohan**  
Lead QA Analyst  
Inter Smart Technologies (P) Ltd  
+917012649326 | +916238375247  
www.intersmartsolution.com | abhiram@intersmart.in

---

## 📊 Monitor Traffic (Optional)

While your tunnels are running, you can monitor all incoming requests:

**Open in browser:** http://localhost:4040

This dashboard shows:
- All HTTP requests in real-time
- Request/response details
- Replay requests
- Connection statistics

---

## ⚠️ Important Notes

### Ngrok Free Tier Limitations:
- ⏰ **Session expires after 2 hours** - You'll need to restart tunnels
- 🔄 **URL changes each time** - New random URL on each restart
- 👥 **60 connections/minute** - Should be fine for demo purposes

### Security:
- ✅ Backend configured to accept ngrok domains
- ✅ CORS properly configured
- ✅ Using demo data only
- 🔒 Change default password after demo if needed

### Troubleshooting:
- **"ngrok not found"** → Make sure you installed it: `brew install ngrok/ngrok/ngrok`
- **"Authentication required"** → Run: `ngrok config add-authtoken YOUR_TOKEN`
- **Frontend can't connect to backend** → Make sure you updated .env with backend ngrok URL and restarted frontend
- **Port in use** → Kill the process: `lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9`

---

## 🛑 After Demo - Cleanup

When you're done with the demo:

1. **Stop ngrok tunnels** (press `Ctrl+C` in both terminal windows)

2. **Revert .env file:**
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Restart frontend** for local development:
   ```bash
   cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"
   npm run dev
   ```

4. **Optional:** Stop servers if not needed:
   ```bash
   # Stop backend
   lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
   
   # Stop frontend
   lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
   ```

---

## ✅ Current Status

**Backend:** ✅ Running on port 5000 with ngrok CORS support  
**Frontend:** ✅ Running on port 5173  
**Ngrok:** ✅ Installed and ready  
**Configuration:** ✅ Ready for environment variable updates  

---

## 🎯 Summary Commands

```bash
# 1. Authenticate ngrok (one-time)
ngrok config add-authtoken YOUR_TOKEN

# 2. Start backend tunnel (Terminal 1)
ngrok http 5000

# 3. Start frontend tunnel (Terminal 2)
ngrok http 5173

# 4. Update .env with backend ngrok URL
code "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool/.env"

# 5. Restart frontend
cd "/Users/admin/Desktop/HTML Test tool/ui-ux-comparison-tool"
# Press Ctrl+C to stop current Vite
npm run dev

# 6. Monitor traffic
open http://localhost:4040
```

---

## 💡 Pro Tips

1. **Keep terminals visible** - So you can see if ngrok disconnects
2. **Take screenshots first** - In case internet issues occur during demo
3. **Test before sharing** - Open the ngrok URL yourself to verify it works
4. **Have backup ready** - Keep local demo running in case of network issues
5. **Monitor the dashboard** - Watch http://localhost:4040 during demo

---

## 📞 Need Help?

If you encounter any issues:
1. Check the NGROK_SHARING_GUIDE.md for detailed troubleshooting
2. Review terminal output for error messages
3. Verify both servers are running: `lsof -i :5000` and `lsof -i :5173`
4. Check ngrok dashboard at http://localhost:4040

---

**Good luck with your presentation! 🚀**

---

_Last updated: 10 November 2025_
