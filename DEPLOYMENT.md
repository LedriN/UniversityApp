# DigitalOcean Deployment Guide

## Prerequisites

1. **DigitalOcean Account** with App Platform access
2. **MongoDB Database** (MongoDB Atlas or DigitalOcean Managed Database)
3. **GitHub Repository** with your code
4. **Environment Variables** ready

## Step 1: Prepare Your Repository

1. **Create Environment Files**:
   ```bash
   # Copy the example environment file
   cp backend/env.example backend/.env
   ```

2. **Update Environment Variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Generate a strong secret (use: `openssl rand -base64 32`)
   - `FRONTEND_URL`: Your DigitalOcean app URL (will be provided after deployment)
   - `EMAIL_USER` & `EMAIL_PASSWORD`: Optional, for email notifications

3. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

## Step 2: Deploy to DigitalOcean App Platform

### Option A: Using DigitalOcean CLI
```bash
# Install doctl
# Create app from app.yaml
doctl apps create --spec .do/app.yaml
```

### Option B: Using DigitalOcean Dashboard
1. Go to DigitalOcean App Platform
2. Click "Create App"
3. Connect your GitHub repository
4. Configure the app:
   - **Source Directory**: `/` (root)
   - **Build Command**: `npm run build:full`
   - **Run Command**: `npm start`
   - **Environment**: Node.js

## Step 3: Configure Environment Variables

In your DigitalOcean App Platform dashboard:

1. Go to your app settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://nushiledri2:ledriFama%40@fama.twjudfu.mongodb.net/?retryWrites=true&w=majority&appName=fama
JWT_SECRET=7e03acefa5a4bf818d005bc5b7fef067
JWT_EXPIRES_IN=24h
EMAIL_USER=nushiledri2@gmail.com
EMAIL_PASSWORD=vpvh wxfy fjna hrqm
FRONTEND_URL=https://your-app-name.ondigitalocean.app
```

**Important**: For initial deployment, use a placeholder URL for `FRONTEND_URL`. After creating the app, you'll get the actual URL and can update this environment variable.

## Step 4: Database Setup

### MongoDB Atlas (Recommended)
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Add it to `MONGODB_URI` environment variable

### DigitalOcean Managed Database
1. Create a MongoDB database in DigitalOcean
2. Use the provided connection string
3. Add it to `MONGODB_URI` environment variable

## Step 5: Seed the Database

After deployment, you can seed the database by running:

```bash
# Connect to your DigitalOcean app
doctl apps ssh your-app-name

# Run the seed script
cd backend && npm run seed
```

## Step 6: Verify Deployment

1. **Check App Status**: Ensure the app is running in DigitalOcean dashboard
2. **Test API Endpoints**: Visit `https://your-app.ondigitalocean.app/api/health`
3. **Test Frontend**: Visit `https://your-app.ondigitalocean.app`
4. **Login**: Use default credentials:
   - Username: `admin`
   - Password: `admin123`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in DigitalOcean dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**:
   - Verify MongoDB URI is correct
   - Check network access to MongoDB
   - Ensure MongoDB is running

3. **Environment Variable Issues**:
   - Verify all required variables are set
   - Check variable names match exactly
   - Restart the app after adding variables

4. **CORS Issues**:
   - Ensure `FRONTEND_URL` is set correctly
   - Check that the URL matches your app's domain

### Debug Commands

```bash
# Check app logs
doctl apps logs your-app-name

# SSH into app container
doctl apps ssh your-app-name

# Check environment variables
echo $MONGODB_URI
echo $JWT_SECRET
```

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **MongoDB**: Use connection string with authentication
3. **Environment Variables**: Never commit .env files
4. **HTTPS**: DigitalOcean App Platform provides SSL automatically
5. **CORS**: Configure properly for production

## Monitoring

1. **App Metrics**: Monitor in DigitalOcean dashboard
2. **Logs**: Check application logs regularly
3. **Database**: Monitor MongoDB performance
4. **Uptime**: Set up monitoring for app availability

## Scaling

To scale your application:

1. **Vertical Scaling**: Increase instance size in app settings
2. **Horizontal Scaling**: Increase instance count
3. **Database Scaling**: Upgrade MongoDB plan as needed

## Backup Strategy

1. **Database Backups**: Enable MongoDB Atlas backups or DigitalOcean backups
2. **Code Backups**: Use GitHub for version control
3. **Environment Backups**: Document all environment variables 