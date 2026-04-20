/**
 * server.js — Main entry point for the Flavr backend application.
 */

const express = require('express');       // Web framework for Node.js
const cors = require('cors');             // Cross-Origin Resource Sharing middleware
const cookieParser = require('cookie-parser'); // Parses cookies from incoming requests
const passport = require('passport');     // Authentication framework
const dotenv = require('dotenv');         // Loads environment variables from .env file
const connectDB = require('./db');        // Custom MongoDB connection utility
const errorHandler = require('./middlewares/errorHandler'); // Centralized error handler

dotenv.config();
require('./config/passport');
connectDB();
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite dev server URL
  credentials: true // Allow cookies and Authorization headers to be sent cross-origin
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(passport.initialize());


app.use('/api', require('./routes/routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
