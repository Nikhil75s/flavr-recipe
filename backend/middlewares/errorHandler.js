/**
 * middlewares/errorHandler.js — Centralised Express error handler.
 */

const errorHandler = (err, req, res, next) => {
  // Log the full error stack trace to the server console for debugging
  console.error('❌ Error:', err.stack);

  // ─── Mongoose Validation Error ──────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // ─── Mongoose Duplicate Key Error ───────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `Duplicate value for field: ${field}` });
  }

  // ─── Mongoose CastError ─────────────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // ─── JWT Errors ─────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Thrown when the JWT has passed its expiration date
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // ─── Fallback: Generic Error ────────────────────────────────────
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
