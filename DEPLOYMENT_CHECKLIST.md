# DigitalOcean Deployment Checklist

## ✅ Pre-Deployment Setup

- [ ] GitHub repository is up to date
- [ ] MongoDB Atlas database is ready
- [ ] Environment variables are documented

## 🚀 Step 1: Create DigitalOcean App

1. **Go to DigitalOcean App Platform**
2. **Click "Create App"**
3. **Connect your GitHub repository**: `https://github.com/LedriN/UniversityApp`
4. **Configure the app**:
   - Source Directory: `/` (root)
   - Build Command: `npm run build:full`
   - Run Command: `npm start`
   - Environment: Node.js

## ⚙️ Step 2: Set Initial Environment Variables

Add these environment variables in DigitalOcean dashboard:

```
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://nushiledri2:ledriFama%40@fama.twjudfu.mongodb.net/?retryWrites=true&w=majority&appName=fama
JWT_SECRET=7e03acefa5a4bf818d005bc5b7fef067
JWT_EXPIRES_IN=24h
EMAIL_USER=nushiledri2@gmail.com
EMAIL_PASSWORD=vpvh wxfy fjna hrqm
FRONTEND_URL=https://placeholder-url.com
```

## 🔗 Step 3: Get Your App URL

After the app is created:
1. **Go to your app dashboard**
2. **Copy the app URL** (e.g., `https://university-app-abc123.ondigitalocean.app`)
3. **Note this URL** - you'll need it for the next step

## 🔄 Step 4: Update FRONTEND_URL

1. **Go to app settings**
2. **Navigate to "Environment Variables"**
3. **Update `FRONTEND_URL`** with your actual app URL
4. **Restart the app**

## ✅ Step 5: Verify Deployment

- [ ] App builds successfully
- [ ] API endpoint works: `https://your-app-url.ondigitalocean.app/api/health`
- [ ] Frontend loads: `https://your-app-url.ondigitalocean.app`
- [ ] Can login with admin/admin123

## 🐛 Troubleshooting

If you encounter issues:
1. Check build logs in DigitalOcean dashboard
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is accessible
4. Check that the `FRONTEND_URL` matches your app URL exactly

## 📞 Support

If you need help:
- Check the `DEPLOYMENT_TROUBLESHOOTING.md` file
- Review DigitalOcean app logs
- Verify environment variables are correct 