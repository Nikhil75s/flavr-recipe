const passport = require('passport');
const generateToken = require('../helpers/generateToken');

// @desc    Start Google OAuth flow
// @route   GET /api/auth/google
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    const token = generateToken(user._id);
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  })(req, res, next);
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { googleAuth, googleCallback, getMe, logout };
