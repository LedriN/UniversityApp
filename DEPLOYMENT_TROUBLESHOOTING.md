# Deployment Troubleshooting Guide

## Issues Fixed

### 1. **Wrong Build Command**
**Problem**: DigitalOcean was running `npm run dev:full` instead of `npm run build:full`
**Solution**: 
- Fixed `.do/app.yaml` to use correct build command
- Separated build and run commands properly

### 2. **Missing Backend Dependencies**
**Problem**: `nodemon: not found` error
**Solution**: 
- Added all backend dependencies to root `package.json`
- Added `nodemon` to devDependencies
- Updated build script to install all dependencies

### 3. **Development vs Production Mode**
**Problem**: Running in development mode instead of production
**Solution**: 
- Set `NODE_ENV=production` in environment variables
- Fixed build process to create production build

### 4. **Port Configuration**
**Problem**: Port mismatch between frontend and backend
**Solution**: 
- Backend runs on port 8080 (DigitalOcean requirement)
- Frontend API calls go to same domain with `/api` path

## Current Configuration

### Build Process
```bash
npm run build:full
# This runs:
# 1. npm run build (builds frontend)
# 2. npm run copy-build (copies to backend/public)
# 3. npm install (installs all dependencies)
```

### Run Process
```bash
npm start
# This runs:
# cd backend && npm start
```

### Environment Variables Required
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

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push origin main
   ```

2. **Deploy to DigitalOcean**:
   - Use the updated `.do/app.yaml` configuration
   - Set environment variables in DigitalOcean dashboard
   - Update `FRONTEND_URL` with your actual app URL

3. **Verify Deployment**:
   - Check build logs for successful build
   - Test API endpoint: `https://your-app.ondigitalocean.app/api/health`
   - Test frontend: `https://your-app.ondigitalocean.app`

## Common Issues and Solutions

### Build Failures
- **Missing dependencies**: All dependencies are now in root package.json
- **Node version**: Specified Node.js >=18.0.0 in engines
- **Build command**: Fixed to use `npm run build:full`

### Runtime Errors
- **Port issues**: Backend runs on port 8080
- **Database connection**: MongoDB Atlas connection configured
- **Environment variables**: All required variables documented

### CORS Issues
- **Frontend URL**: Set `FRONTEND_URL` to your DigitalOcean app URL
- **API calls**: Frontend calls same domain with `/api` path

## Testing Locally

To test the production build locally:

```bash
# Build the application
npm run build:full

# Start the server
npm start

# Visit http://localhost:8080
```

## Monitoring

- Check DigitalOcean app logs for errors
- Monitor MongoDB Atlas for connection issues
- Test all functionality after deployment 