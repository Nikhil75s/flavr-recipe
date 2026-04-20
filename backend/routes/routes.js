/**
 * routes.js — Centralised API route definitions for the Flavr backend.
 */

const router = require('express').Router();

// ─── Controller Imports ─────────────────────────────────────────────
const { googleAuth, googleCallback, getMe, logout } = require('../controllers/authController');

// Recipe controller — handles recipe CRUD and user-specific recipe queries
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByUser,
} = require('../controllers/recipeController');

// User controller — handles profile viewing/editing and saved recipes
const {
  getUserProfile,
  updateProfile,
  getSavedRecipes,
  toggleSaveRecipe,
} = require('../controllers/userController');

const { getReviews, addReview, updateReview, deleteReview } = require('../controllers/reviewController');

const { protect } = require('../middlewares/authMiddleware');

const { upload } = require('../helpers/cloudinary');

router.get('/auth/google', googleAuth);

router.get('/auth/google/callback', googleCallback);

router.get('/auth/me', protect, getMe);

router.post('/auth/logout', protect, logout);

router.get('/recipes', getRecipes);

router.get('/recipes/user/:userId', getRecipesByUser);

router.get('/recipes/:id', getRecipe);

router.post('/recipes', protect, upload.single('image'), createRecipe);

router.put('/recipes/:id', protect, upload.single('image'), updateRecipe);

router.delete('/recipes/:id', protect, deleteRecipe);

router.get('/users/:id', getUserProfile);

router.put('/users/profile', protect, updateProfile);

router.get('/users/saved/recipes', protect, getSavedRecipes);

router.post('/users/save/:recipeId', protect, toggleSaveRecipe);

router.get('/reviews/:recipeId', getReviews);

router.post('/reviews/:recipeId', protect, addReview);

router.put('/reviews/:reviewId', protect, updateReview);

router.delete('/reviews/:reviewId', protect, deleteReview);

module.exports = router;
