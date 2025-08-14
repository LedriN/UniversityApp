const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const lectureRoutes = require('./routes/lectures');
const paymentRecordRoutes = require('./routes/paymentRecords');
const subjectRoutes = require('./routes/subjects');

const app = express();
const PORT = process.env.PORT || 8080; // Digital Ocean expects port 8080

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : [
      'http://localhost:5173',
      'http://localhost:5000', 
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000'
    ];

console.log('🔧 CORS Origins configured:', corsOrigins);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔗 FRONTEND_URL from env:', process.env.FRONTEND_URL);

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/payment-records', paymentRecordRoutes);
app.use('/api/subjects', subjectRoutes);

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'University Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler (only for API routes in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

// MongoDB Connection
console.log('🔍 MongoDB URI being used:');
console.log(process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`🌐 Frontend served at http://localhost:${PORT}`);
    }
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});