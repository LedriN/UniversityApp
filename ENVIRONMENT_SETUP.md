# Environment Variables Setup for DigitalOcean Deployment

## Backend Environment Variables (.env file in backend directory)

Create a file called `.env` in the `backend` directory with the following content:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://nushiledri2:ledriFama%40@fama.twjudfu.mongodb.net/?retryWrites=true&w=majority&appName=fama

# JWT Secret
JWT_SECRET=7e03acefa5a4bf818d005bc5b7fef067
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_USER=nushiledri2@gmail.com
EMAIL_PASSWORD=vpvh wxfy fjna hrqm

# Server Configuration
PORT=8080
NODE_ENV=production

# Frontend URL for CORS (UPDATE THIS AFTER DEPLOYMENT)
FRONTEND_URL=https://your-app-name.ondigitalocean.app
```

## Frontend Environment Variables (.env file in root directory)

Create a file called `.env` in the root directory with the following content:

```env
# Frontend Environment Variables
# UPDATE THIS AFTER DEPLOYMENT
VITE_API_BASE_URL=https://your-app-name.ondigitalocean.app/api
```

## DigitalOcean App Platform Environment Variables

In your DigitalOcean App Platform dashboard, add these environment variables:

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

## Important Notes

1. **Update URLs After Deployment**: 
   - Replace `your-app-name.ondigitalocean.app` with your actual DigitalOcean app URL
   - This will be provided after you create the app in DigitalOcean

2. **Security**: 
   - Never commit `.env` files to version control
   - The `.env` files are already in `.gitignore`

3. **Port Configuration**:
   - Backend runs on port 8080 (DigitalOcean requirement)
   - Frontend API calls will go to the same domain but with `/api` path

4. **Database**:
   - Your MongoDB Atlas connection is already configured
   - Make sure the database is accessible from DigitalOcean's servers

## Deployment Steps

1. Create the `.env` files locally (for testing)
2. Deploy to DigitalOcean App Platform
3. Update the environment variables in DigitalOcean dashboard with your app URL
4. Test the application

## Testing Locally

To test with production settings locally:

1. Create the `.env` files as shown above
2. Update `FRONTEND_URL` to `http://localhost:8080`
3. Update `VITE_API_BASE_URL` to `http://localhost:8080/api`
4. Run: `npm run dev:full` 