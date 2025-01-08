require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
require('./config/passport');
const cors = require('cors');


const app = express();
app.use(cors({
  origin: 'http://localhost:3001', // frontend URL
  credentials: true
}));

// Update MongoDB connection URI to use IPv4 explicitly
const mongoURI = 'mongodb://127.0.0.1:27017/lofi';

// Improved MongoDB connection with error handling
mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if unable to connect to database
  });

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Home Page');
});

app.get('/dashboard', (req, res) => {
  res.send('Dashboard - User is logged in');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});