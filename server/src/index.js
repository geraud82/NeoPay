require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Make supabase client available to routes
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Import authentication middleware
const { authMiddleware } = require('./middleware/auth');

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NeoPay API' });
});

// API Routes
// Public routes (no authentication required)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NeoPay API' });
});

// Protected routes (authentication required)
app.use('/api/drivers', authMiddleware, require('./routes/drivers'));
app.use('/api/payments', authMiddleware, require('./routes/payments'));
app.use('/api/receipts', authMiddleware, require('./routes/receipts'));
app.use('/api/expenses', authMiddleware, require('./routes/expenses'));
app.use('/api/trips', authMiddleware, require('./routes/trips'));
app.use('/api/loads', authMiddleware, require('./routes/loads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});
