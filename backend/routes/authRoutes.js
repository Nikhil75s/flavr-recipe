const router = require('express').Router();
const { googleAuth, googleCallback, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
