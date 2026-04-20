/**
 * middlewares/authMiddleware.js — JWT authentication middleware.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware — guards routes that require a logged-in user.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and follows "Bearer <token>" format
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Extract the token part (after "Bearer ")
    token = req.headers.authorization.split(' ')[1];
  }

  // No token found — user is not authenticated
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify the token and decode the payload (contains { id: userId })
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from the database, excluding the __v (version key) field
    req.user = await User.findById(decoded.id).select('-__v');

    // Edge case: token is valid but user was deleted from the database
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // User authenticated successfully — proceed to the next handler
    next();
  } catch (error) {
    // Token verification failed (expired, tampered, malformed)
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = { protect };
