/**
 * controllers/authController.js — Authentication request handlers.
 */

const passport = require('passport');
const generateToken = require('../helpers/generateToken');

/**
 * @desc    Start Google OAuth flow — redirects user to Google's login page
 * @route   GET /api/auth/google
 * @access  Public
 *
 * passport.authenticate('google') triggers the GoogleStrategy defined in config/passport.js.
 */
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

/**
 * @desc    Handle the OAuth callback from Google after user grants permission
 * @route   GET /api/auth/google/callback
 * @access  Public (called by Google, not directly by the frontend)
 */
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    // Authentication failed or user not returned — redirect with error
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate a JWT token containing the user's MongoDB _id
    const token = generateToken(user._id);

    // Redirect to the frontend AuthSuccess page which extracts the token from the URL
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  })(req, res, next);
};

/**
 * @desc    Get the currently logged-in user's profile data
 * @route   GET /api/auth/me
 * @access  Private (requires JWT via protect middleware)
 */
const getMe = async (req, res) => {
  res.json(req.user);
};

/**
 * @desc    Logout the user
 * @route   POST /api/auth/logout
 * @access  Private (requires JWT via protect middleware)
 */
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { googleAuth, googleCallback, getMe, logout };
