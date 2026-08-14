require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const tradesRoutes = require('./routes/trades');
const ratesRoutes = require('./routes/rates');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackwolf', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradesRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'BlackWolf is running 🐺' });
});

// Real-time price updates via WebSocket
io.on('connection', (socket) => {
  console.log(`📡 User connected: ${socket.id}`);
  
  socket.on('subscribe_rates', (currencies) => {
    socket.join('rates_room');
    console.log(`📊 User subscribed to rates: ${currencies}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Broadcast real-time rates every 2 seconds
setInterval(() => {
  const mockRates = {
    'USD/EUR': (Math.random() * (0.95 - 0.90) + 0.90).toFixed(4),
    'USD/GBP': (Math.random() * (0.82 - 0.77) + 0.77).toFixed(4),
    'USD/JPY': (Math.random() * (152 - 148) + 148).toFixed(2),
    'EUR/GBP': (Math.random() * (0.88 - 0.84) + 0.84).toFixed(4),
  };
  io.to('rates_room').emit('rates_update', mockRates);
}, 2000);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    success: false, 
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🐺 BlackWolf Server running on port ${PORT}`);
});

module.exports = { app, io };
