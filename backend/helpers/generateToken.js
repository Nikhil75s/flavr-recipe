/**
 * helpers/generateToken.js — JWT token generation utility.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a given user.
 *
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} A signed JWT token valid for 30 days
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Payload — stored inside the token
    process.env.JWT_SECRET,      // Secret key used to sign the token (from .env)
    { expiresIn: '30d' }         // Token expires in 30 days
  );
};

module.exports = generateToken;
