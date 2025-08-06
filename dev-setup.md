# Development Setup Guide

## Quick Start

To run the full application (frontend + backend):

```bash
npm run dev:full
```

This will start:
- Frontend (Vite) on http://localhost:5173
- Backend (Express) on http://localhost:8080

## Individual Commands

### Frontend Only
```bash
npm run dev
```

### Backend Only
```bash
cd backend && npm run dev
```

### Production Build
```bash
npm run build:full
```

## Troubleshooting

### If you get "connection refused" errors:
1. Make sure both servers are running
2. Check that the backend is running on port 8080
3. Verify your environment variables are set correctly

### If backend fails to start:
1. Check if MongoDB is running and accessible
2. Verify your `.env` file in the backend directory
3. Make sure all backend dependencies are installed: `cd backend && npm install`

### Environment Variables
Make sure you have a `.env` file in the backend directory with:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `NODE_ENV` - Set to "development" for local development 