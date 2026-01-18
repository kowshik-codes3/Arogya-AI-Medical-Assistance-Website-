const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const healthRoutes = require('./src/routes/health');
const screeningRoutes = require('./src/routes/screening');
const analyticsRoutes = require('./src/routes/analytics');
const emergencyRoutes = require('./src/routes/emergency');
// const notificationRoutes = require('./src/routes/notifications');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { authenticateToken } = require('./src/middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya_ai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

app.use('/api/auth', authLimiter);
app.use('/api', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Arogya AI Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/health', authenticateToken, healthRoutes);
app.use('/api/screening', authenticateToken, screeningRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/emergency', emergencyRoutes); // Emergency routes don't require auth for quick access
// app.use('/api/notifications', authenticateToken, notificationRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user-specific room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle emergency alerts
  socket.on('emergency-alert', (data) => {
    console.log('🚨 Emergency alert received:', data);
    // Broadcast to emergency services or contacts
    io.emit('emergency-broadcast', data);
  });

  // Handle real-time health monitoring
  socket.on('health-monitoring-start', (userId) => {
    socket.join(`monitoring_${userId}`);
    console.log(`📊 Health monitoring started for user ${userId}`);
  });

  socket.on('health-monitoring-data', (data) => {
    // Broadcast real-time health data to monitoring room
    socket.to(`monitoring_${data.userId}`).emit('health-data-update', data);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// 404 handler (Express 5 compatible)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  🚀 ====================================
     Arogya AI Backend Server Started
  ====================================
  📍 Server: http://localhost:${PORT}
  📊 Health Check: http://localhost:${PORT}/health
  📱 Socket.IO: Enabled
  🗄️  Database: MongoDB
  🔐 Security: Enabled
  ====================================
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down server gracefully...');
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('🗄️  MongoDB connection closed');
    } catch (err) {
      console.error('❌ Error closing MongoDB connection:', err);
    }
    
    process.exit(0);
  });
});

module.exports = { app, io };