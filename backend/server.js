const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Set security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false // disable for local asset loads / maps
}));

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// Rate limiting (150 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 150,
  message: 'Too many requests from this IP, please try again in 10 minutes'
});
app.use('/api', limiter);

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Root friendly landing route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to StayNest API Server!',
    status: 'Live & Healthy',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      listings: '/api/listings',
      auth: '/api/auth'
    }
  });
});

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'StayNest API is running smoothly' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5004;

// Wrap server in HTTP for Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
